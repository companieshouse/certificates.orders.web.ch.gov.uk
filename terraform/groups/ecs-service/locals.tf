# Define all hardcoded local variable and local variables looked up from data resources
locals {
  stack_name                = "order-service" # this must match the stack name the service deploys into
  name_prefix               = "${local.stack_name}-${var.environment}"
  service_name              = "certificates_orders_web" # testing service name
  container_port            = "3000" # default node port required here until prod docker container is built allowing port change via env var
  docker_repo               = "certificates_orders_web"
  lb_listener_rule_priority = 10
  lb_listener_paths         = ["/certificates_orders*"]
  healthcheck_path          = "/certificates_orders" #healthcheck path for certificates orders web
  healthcheck_matcher       = "200-302" # no explicit healthcheck in this service yet, change this when added!

  service_secrets           = jsondecode(data.vault_generic_secret.service_secrets.data_json)

  parameter_store_secrets    = {
    "vpc_name"                  = local.service_secrets["vpc_name"]
    "chs_api_key"               = local.service_secrets["chs_api_key"]
    "internal_api_url"          = local.service_secrets["internal_api_url"]
    "cdn_host"                  = local.service_secrets["cdn_host"]
    "oauth2_auth_uri"           = local.service_secrets["oauth2_auth_uri"]
    "oauth2_redirect_uri"       = local.service_secrets["oauth2_redirect_uri"]
    "account_test_url"          = local.service_secrets["account_test_url"]
    "account_url"               = local.service_secrets["account_url"]
    "cache_server"              = local.service_secrets["cache_server"]
  }

  vpc_name                  = local.service_secrets["vpc_name"]
  chs_api_key               = local.service_secrets["chs_api_key"]
  internal_api_url          = local.service_secrets["internal_api_url"]
  cdn_host                  = local.service_secrets["cdn_host"]
  oauth2_auth_uri           = local.service_secrets["oauth2_auth_uri"]
  oauth2_redirect_uri       = local.service_secrets["oauth2_redirect_uri"]
  account_test_url          = local.service_secrets["account_test_url"]
  account_url               = local.service_secrets["account_url"]
  cache_server              = local.service_secrets["cache_server"]

  # create a map of secret name => secret arn to pass into ecs service module
  # using the trimprefix function to remove the prefixed path from the secret name
  secrets_arn_map = {
    for sec in data.aws_ssm_parameter.secret:
      trimprefix(sec.name, "/${local.name_prefix}/") => sec.arn
  }

  service_secrets_arn_map = {
    for sec in module.secrets.secrets:
      trimprefix(sec.name, "/${local.service_name}-${var.environment}/") => sec.arn
  }

  task_secrets = [
    { "name": "CHS_DEVELOPER_CLIENT_ID", "valueFrom": "${local.secrets_arn_map.web-oauth2-client-id}" },
    { "name": "CHS_DEVELOPER_CLIENT_SECRET", "valueFrom": "${local.secrets_arn_map.web-oauth2-client-secret}" },
    { "name": "COOKIE_SECRET", "valueFrom": "${local.secrets_arn_map.web-oauth2-cookie-secret}" },
    { "name": "DEVELOPER_OAUTH2_REQUEST_KEY", "valueFrom": "${local.secrets_arn_map.web-oauth2-request-key}" },
    { "name": "CHS_API_KEY", "valueFrom": "${local.service_secrets_arn_map.chs_api_key}" },
    { "name": "CACHE_SERVER", "valueFrom": "${local.service_secrets_arn_map.cache_server}" },
    { "name": "OAUTH2_REDIRECT_URI", "valueFrom": "${local.service_secrets_arn_map.oauth2_redirect_uri}" },
    { "name": "OAUTH2_AUTH_URI", "valueFrom": "${local.service_secrets_arn_map.oauth2_auth_uri}" },
    { "name": "ACCOUNT_URL", "valueFrom": "${local.service_secrets_arn_map.account_url}" },
    { "name": "ACCOUNT_TEST_URL", "valueFrom": "${local.service_secrets_arn_map.account_test_url}" },
    { "name": "INTERNAL_API_URL", "valueFrom": "${local.service_secrets_arn_map.internal_api_url}" }
  ]

  task_environment = [
    { "name": "NODE_PORT", "value": "${local.container_port}" },
    { "name": "LOGLEVEL", "value": "${var.log_level}" },
    { "name": "CHS_URL", "value": "${var.chs_url}" },
    { "name": "PIWIK_URL", "value": "${var.piwik_url}" },
    { "name": "PIWIK_SITE_ID", "value": "${var.piwik_site_id}" },
    { "name": "REDIRECT_URI", "value": "${var.redirect_uri}" },
    { "name": "CDN_HOST", "value": "//${var.cdn_host}" },
    { "name": "CACHE_POOL_SIZE", "value": "${var.cache_pool_size}" },
    { "name": "COOKIE_DOMAIN", "value": "${var.cookie_domain}" },
    { "name": "COOKIE_NAME", "value": "${var.cookie_name}" },
    { "name": "COOKIE_SECURE_ONLY", "value": "${var.cookie_secure_only}" },
    { "name": "DEFAULT_SESSION_EXPIRATION", "value": "${var.default_session_expiration}" },
    { "name": "APPLICATIONS_API_URL", "value": "${var.account_local_url}" },
    { "name": "RADIO_BUTTON_VALUE_LOG_LENGTH", "value": "${var.radio_button_value_log_length}" },
    { "name": "SHOW_SERVICE_OFFLINE_PAGE", "value": "${var.show_service_offline_page}" },
    { "name": "URL_LOG_MAX_LENGTH", "value": "${var.url_log_max_length}" },
    { "name": "URL_PARAM_MAX_LENGTH", "value": "${var.url_param_max_length}" },
    { "name": "FEATURE_FLAG_PRIVATE_SDK_12052021", "value": "${var.feature_flag_private_sdk_12052021}" },
    { "name": "FEATURE_FLAG_ACTIVE_OFFICERS_01072021", "value": "${var.feature_flag_active_officers_01072021}" },
    { "name": "FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021", "value": "${var.feature_flag_five_or_less_officers_journey_21102021}" },
    { "name": "PSC_STATEMENTS_API_PAGE_SIZE", "value": "${var.psc_statements_api_page_size}" },
    { "name": "API_URL", "value": "${var.api_url}" }
  ]
}
