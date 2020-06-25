const FeatherErrorCode = {
  API_KEY_EXPIRED: "api_key_expired",
  API_KEY_MISSING: "api_key_missing",
  API_KEY_INVALID: "api_key_invalid",
  CREDENTIAL_ALREADY_USED: "credential_already_used",
  CREDENTIAL_INVALID: "credential_invalid",
  CURRENT_STATE_INCONSISTENT: "current_state_inconsistent",
  HEADER_EMPTY: "header_empty",
  HEADER_MISSING: "header_missing",
  INSUFFICIENT_PERMISSIONS: "insufficient_permissions",
  PARAMETER_EMPTY: "parameter_empty",
  PARAMETER_INVALID: "parameter_invalid",
  PARAMETER_MISSING: "parameter_missing",
  PARAMETER_UNKNOWN: "parameter_unknown",
  PARAMETERS_EXCLUSIVE: "parameters_exclusive",
  REQUEST_INVALID: "request_invalid",
  RESOURCE_MISSING: "resource_missing",
  RESOURCE_IMMUTABLE: "resource_immutable",
  SESSION_EXPIRED: "session_expired",
  SESSION_INACTIVE: "session_inactive",
  SESSION_REVOKED: "session_revoked",
  TOKEN_EXPIRED: "token_expired",
  TOKEN_INVALID: "token_invalid",
  USER_ALREADY_EXISTS: "user_already_exists",
  VERIFICATION_CODE_INVALID: "verification_code_invalid",
  VERIFICATION_CODE_ALEADY_USED: "verification_code_already_used"
};

module.exports = FeatherErrorCode;
