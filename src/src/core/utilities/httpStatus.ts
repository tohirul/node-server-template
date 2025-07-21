class HttpStatus {
  // Status codes
  static CONTINUE = 100;
  static SWITCHING_PROTOCOLS = 101;
  static PROCESSING = 102;
  static EARLY_HINTS = 103;

  static OK = 200;
  static CREATED = 201;
  static ACCEPTED = 202;
  static NON_AUTHORITATIVE_INFORMATION = 203;
  static NO_CONTENT = 204;
  static RESET_CONTENT = 205;
  static PARTIAL_CONTENT = 206;
  static MULTI_STATUS = 207;
  static ALREADY_REPORTED = 208;
  static IM_USED = 226;

  static MULTIPLE_CHOICES = 300;
  static MOVED_PERMANENTLY = 301;
  static FOUND = 302;
  static SEE_OTHER = 303;
  static NOT_MODIFIED = 304;
  static TEMPORARY_REDIRECT = 307;
  static PERMANENT_REDIRECT = 308;

  static BAD_REQUEST = 400;
  static UNAUTHORIZED = 401;
  static PAYMENT_REQUIRED = 402;
  static FORBIDDEN = 403;
  static NOT_FOUND = 404;
  static METHOD_NOT_ALLOWED = 405;
  static NOT_ACCEPTABLE = 406;
  static PROXY_AUTHENTICATION_REQUIRED = 407;
  static REQUEST_TIMEOUT = 408;
  static CONFLICT = 409;
  static GONE = 410;
  static LENGTH_REQUIRED = 411;
  static PRECONDITION_FAILED = 412;
  static PAYLOAD_TOO_LARGE = 413;
  static URI_TOO_LONG = 414;
  static UNSUPPORTED_MEDIA_TYPE = 415;
  static RANGE_NOT_SATISFIABLE = 416;
  static EXPECTATION_FAILED = 417;
  static IM_A_TEAPOT = 418;
  static MISDIRECTED_REQUEST = 421;
  static UNPROCESSABLE_ENTITY = 422;
  static LOCKED = 423;
  static FAILED_DEPENDENCY = 424;
  static TOO_EARLY = 425;
  static UPGRADE_REQUIRED = 426;
  static PRECONDITION_REQUIRED = 428;
  static TOO_MANY_REQUESTS = 429;
  static REQUEST_HEADER_FIELDS_TOO_LARGE = 431;
  static UNAVAILABLE_FOR_LEGAL_REASONS = 451;

  static INTERNAL_SERVER_ERROR = 500;
  static NOT_IMPLEMENTED = 501;
  static BAD_GATEWAY = 502;
  static SERVICE_UNAVAILABLE = 503;
  static GATEWAY_TIMEOUT = 504;
  static HTTP_VERSION_NOT_SUPPORTED = 505;
  static VARIANT_ALSO_NEGOTIATES = 506;
  static INSUFFICIENT_STORAGE = 507;
  static LOOP_DETECTED = 508;
  static NOT_EXTENDED = 510;
  static NETWORK_AUTHENTICATION_REQUIRED = 511;

  // Code to message map
  static messages = {
    // 1xx
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",

    // 2xx
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",

    // 3xx
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    307: "Temporary Redirect",
    308: "Permanent Redirect",

    // 4xx
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",

    // 5xx
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
  };

  // Get message by code
  static getMessage(code: number): string {
    return (
      this.messages[code as keyof typeof HttpStatus.messages] ||
      "Unknown Status"
    );
  }

  // Type checkers
  static isInformational(code: number): boolean {
    return code >= 100 && code < 200;
  }

  static isSuccess(code: number): boolean {
    return code >= 200 && code < 300;
  }

  static isRedirection(code: number): boolean {
    return code >= 300 && code < 400;
  }

  static isClientError(code: number): boolean {
    return code >= 400 && code < 500;
  }

  static isServerError(code: number): boolean {
    return code >= 500 && code < 600;
  }
}

export default HttpStatus;
