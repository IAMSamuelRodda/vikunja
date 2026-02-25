// Vikunja is a to-do list application to facilitate your life.
// Copyright 2018-present Vikunja and contributors. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

package v1

import (
	"net/http"

	"code.vikunja.io/api/pkg/config"
	"code.vikunja.io/api/pkg/db"
	"code.vikunja.io/api/pkg/models"
	"code.vikunja.io/api/pkg/modules/auth"
	"code.vikunja.io/api/pkg/modules/auth/ldap"
	"code.vikunja.io/api/pkg/modules/keyvalue"
	user2 "code.vikunja.io/api/pkg/user"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v5"
)

// Login is the login handler
// @Summary Login
// @Description Logs a user in. Returns a JWT-Token to authenticate further requests.
// @tags auth
// @Accept json
// @Produce json
// @Param credentials body user.Login true "The login credentials"
// @Success 200 {object} auth.Token
// @Failure 400 {object} models.Message "Invalid user password model."
// @Failure 412 {object} models.Message "Invalid totp passcode."
// @Failure 403 {object} models.Message "Invalid username or password."
// @Router /login [post]
func Login(c *echo.Context) (err error) {
	u := user2.Login{}
	if err := c.Bind(&u); err != nil {
		return c.JSON(http.StatusBadRequest, models.Message{Message: "Please provide a username and password."})
	}

	s := db.NewSession()
	defer s.Close()

	var user *user2.User
	if config.AuthLdapEnabled.GetBool() {
		user, err = ldap.AuthenticateUserInLDAP(s, u.Username, u.Password, config.AuthLdapGroupSyncEnabled.GetBool(), config.AuthLdapAvatarSyncAttribute.GetString())
		if err != nil && !user2.IsErrWrongUsernameOrPassword(err) {
			_ = s.Rollback()
			return err
		}
	}

	if user == nil {
		// This allows us to still have local users while ldap is enabled
		user, err = user2.CheckUserCredentials(s, &u)
		if err != nil {
			_ = s.Rollback()
			return err
		}
	}

	if user.Status == user2.StatusDisabled {
		_ = s.Rollback()
		return &user2.ErrAccountDisabled{UserID: user.ID}
	}

	totpEnabled, err := user2.TOTPEnabledForUser(s, user)
	if err != nil {
		_ = s.Rollback()
		return err
	}

	if totpEnabled {
		if u.TOTPPasscode == "" {
			_ = s.Rollback()
			return user2.ErrInvalidTOTPPasscode{}
		}

		_, err = user2.ValidateTOTPPasscode(s, &user2.TOTPPasscode{
			User:     user,
			Passcode: u.TOTPPasscode,
		})
		if err != nil {
			if user2.IsErrInvalidTOTPPasscode(err) {
				user2.HandleFailedTOTPAuth(s, user)
			}
			_ = s.Rollback()
			return err
		}
	}

	if err := keyvalue.Del(user.GetFailedTOTPAttemptsKey()); err != nil {
		return err
	}
	if err := keyvalue.Del(user.GetFailedPasswordAttemptsKey()); err != nil {
		return err
	}

	if err := s.Commit(); err != nil {
		_ = s.Rollback()
		return err
	}

	// Create token
	return auth.NewUserAuthTokenResponse(user, c, u.LongToken)
}

// RenewToken gives a new token to every user with a valid token
// If the token is valid is checked in the middleware.
// @Summary Renew user token
// @Description Returns a new valid jwt user token with an extended length.
// @tags user
// @Accept json
// @Produce json
// @Success 200 {object} auth.Token
// @Failure 400 {object} models.Message "Only user token are available for renew."
// @Router /user/token [post]
func RenewToken(c *echo.Context) (err error) {
	jwtinf := c.Get("user").(*jwt.Token)
	claims := jwtinf.Claims.(jwt.MapClaims)
	typFloat, is := claims["type"].(float64)
	if !is {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid JWT token.")
	}
	typ := int(typFloat)

	if typ == auth.AuthTypeUser {
		return echo.NewHTTPError(
			http.StatusBadRequest,
			"User tokens cannot be renewed via this endpoint. Use POST /user/token/refresh with a refresh token.",
		)
	}

	if typ != auth.AuthTypeLinkShare {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid token type.")
	}

	s := db.NewSession()
	defer s.Close()

	share := &models.LinkSharing{}
	idFloat, is := claims["id"].(float64)
	if !is {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid JWT token.")
	}
	share.ID = int64(idFloat)
	err = share.ReadOne(s, share)
	if err != nil {
		_ = s.Rollback()
		return err
	}
	t, err := auth.NewLinkShareJWTAuthtoken(share)
	if err != nil {
		_ = s.Rollback()
		return err
	}

	if err := s.Commit(); err != nil {
		_ = s.Rollback()
		return err
	}

	return c.JSON(http.StatusOK, auth.Token{Token: t})
}

// NOTE: RefreshToken (session-based auth) will be added when cherry-picking the session auth feature block.
