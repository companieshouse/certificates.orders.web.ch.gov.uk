# Define all hardcoded local variable and local variables looked up from data resources
locals {
  stack_name                = "order-service" # this must match the stack name the service deploys into
  name_prefix               = "${local.stack_name}-${var.environment}"
  service_name              = "certificates-orders-web" # testing service name
  container_port            = "3000"                    # default node port required here until prod docker container is built allowing port change via env var
  docker_repo               = "certificates.orders.web.ch.gov.uk"
  lb_listener_rule_priority = 11
  lb_listener_paths         = ["/certificates_orders*"]
  healthcheck_path          = "/certificates_orders" #healthcheck path for certificates orders web
  healthcheck_matcher       = "200-302"              # no explicit healthcheck in this service yet, change this when added!

  service_secrets = jsondecode(data.vault_generic_secret.service_secrets.data_json)

  vpc_name = local.service_secrets["vpc_name"]

  parameter_store_secrets = {
    "account_url"         = local.service_secrets["account_url"]
    "api_url"             = local.service_secrets["api_url"]
    "cache_server"        = local.service_secrets["cache_server"]
    "cdn_host"            = local.service_secrets["cdn_host"]
    "chs_api_key"         = local.service_secrets["chs_api_key"]
    "chs_monitor_gui_url" = local.service_secrets["chs_monitor_gui_url"]
    "chs_url"             = local.service_secrets["chs_url"]
    "cookie_domain"       = local.service_secrets["cookie_domain"]
    "cookie_secret"       = local.service_secrets["cookie_secret"]
    "piwik_site_id"       = local.service_secrets["piwik_site_id"]
    "piwik_url"           = local.service_secrets["piwik_url"]
    "vpc_name"            = local.service_secrets["vpc_name"]
  }

  # create a map of secret name => secret arn to pass into ecs service module
  # using the trimprefix function to remove the prefixed path from the secret name
  secrets_arn_map = {
    for sec in data.aws_ssm_parameter.secret :
    trimprefix(sec.name, "/${local.name_prefix}/") => sec.arn
  }

  service_secrets_arn_map = {
    for sec in module.secrets.secrets :
    trimprefix(sec.name, "/${local.service_name}-${var.environment}/") => sec.arn
  }

  task_secrets = [
    { "name" : "ACCOUNT_URL", "valueFrom" : "${local.service_secrets_arn_map.account_url}" },
    { "name" : "API_URL", "valueFrom" : "${local.service_secrets_arn_map.api_url}" },
    { "name" : "CACHE_SERVER", "valueFrom" : "${local.service_secrets_arn_map.cache_server}" },
    { "name" : "CDN_HOST", "valueFrom" : "${local.service_secrets_arn_map.cdn_host}" },
    { "name" : "CHS_API_KEY", "valueFrom" : "${local.service_secrets_arn_map.chs_api_key}" },
    { "name" : "CHS_MONITOR_GUI_URL", "valueFrom" : "${local.service_secrets_arn_map.chs_monitor_gui_url}" },
    { "name" : "CHS_URL", "valueFrom" : "${local.service_secrets_arn_map.chs_url}" },
    { "name" : "COOKIE_DOMAIN", "valueFrom" : "${local.service_secrets_arn_map.cookie_domain}" },
    { "name" : "COOKIE_SECRET", "valueFrom" : "${local.service_secrets_arn_map.cookie_secret}" },
    { "name" : "PIWIK_SITE_ID", "valueFrom" : "${local.service_secrets_arn_map.piwik_site_id}" },
    { "name" : "PIWIK_URL", "valueFrom" : "${local.service_secrets_arn_map.piwik_url}" },
    { "name" : "CHS_DEVELOPER_CLIENT_ID", "valueFrom" : "${local.secrets_arn_map.web-oauth2-client-id}" },
    { "name" : "CHS_DEVELOPER_CLIENT_SECRET", "valueFrom" : "${local.secrets_arn_map.web-oauth2-client-secret}" },
    { "name" : "DEVELOPER_OAUTH2_REQUEST_KEY", "valueFrom" : "${local.secrets_arn_map.web-oauth2-request-key}" }
  ]

  task_environment = [
    { "name" : "NODE_PORT", "value" : "${local.container_port}" },
    { "name" : "BASKET_ITEM_LIMIT", "value" : "${var.basket_item_limit}" },
    { "name" : "CERTIFICATE_PIWIK_START_GOAL_ID", "value" : "${var.certificate_piwik_start_goal_id}" },
    { "name" : "CERTIFIED_COPIES_PIWIK_START_GOAL_ID", "value" : "${var.certified_copies_piwik_start_goal_id}" },
    { "name" : "COOKIE_NAME", "value" : "${var.cookie_name}" },
    { "name" : "DEFAULT_SESSION_EXPIRATION", "value" : "${var.default_session_expiration}" },
    { "name" : "DISPATCH_DAYS", "value" : "${var.dispatch_days}" },
    { "name" : "DISSOLVED_CERTIFICATE_PIWIK_START_GOAL_ID", "value" : "${var.dissolved_certificate_piwik_start_goal_id}" },
    { "name" : "HUMAN_LOG", "value" : "${var.human_log}" },
    { "name" : "LOG_LEVEL", "value" : "${var.log_level}" },
    { "name" : "MISSING_IMAGE_DELIVERY_PIWIK_START_GOAL_ID", "value" : "${var.missing_image_delivery_piwik_start_goal_id}" },
    { "name" : "TZ", "value" : "${var.tz}" },
    { "name" : "DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED", "value" : "${var.dynamic_lp_certificate_orders_enabled}" },
    { "name" : "DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED", "value" : "${var.dynamic_llp_certificate_orders_enabled}" },
    { "name" : "LP_CERTIFICATE_PIWIK_START_GOAL_ID", "value" : "${var.lp_certificate_piwik_start_goal_id}" },
    { "name" : "LLP_CERTIFICATE_PIWIK_START_GOAL_ID", "value" : "${var.llp_certificate_piwik_start_goal_id}" },
    { "name" : "LIQUIDATED_COMPANY_CERTIFICATES_ENABLED", "value" : "${var.liquidated_company_certificates_enabled}" },
    { "name" : "ADMINISTRATOR_COMPANY_CERTIFICATES_ENABLED", "value" : "${var.administrator_company_certificates_enabled}" }
  ]
}
