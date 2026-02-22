export type ScappleErrorCode =
  | "PARSE_INVALID_XML"
  | "PARSE_MISSING_ELEMENT"
  | "PARSE_INVALID_FORMAT"
  | "VALIDATION_INVALID_ID"
  | "VALIDATION_INVALID_COLOR"
  | "VALIDATION_DUPLICATE_ID"
  | "IO_READ_FAILED"
  | "IO_WRITE_FAILED"
  | "IO_INVALID_PATH"
  | "RENDER_SVG_FAILED"
  | "RENDER_PNG_FAILED";

export class ScappleError extends Error {

  readonly code: ScappleErrorCode;
  readonly context: Record<string, unknown>;

  constructor(
    message: string,
    code: ScappleErrorCode,
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "ScappleError";
    this.code = code;
    this.context = context;
  }
}

export class ScappleParseError extends ScappleError {

  constructor(
    message: string,
    code: ScappleErrorCode = "PARSE_INVALID_XML",
    context: Record<string, unknown> = {}
  ) {
    super(message, code, context);
    this.name = "ScappleParseError";
  }
}

export class ScappleValidationError extends ScappleError {

  constructor(
    message: string,
    code: ScappleErrorCode = "VALIDATION_INVALID_ID",
    context: Record<string, unknown> = {}
  ) {
    super(message, code, context);
    this.name = "ScappleValidationError";
  }
}

export class ScappleIOError extends ScappleError {

  constructor(
    message: string,
    code: ScappleErrorCode = "IO_READ_FAILED",
    context: Record<string, unknown> = {}
  ) {
    super(message, code, context);
    this.name = "ScappleIOError";
  }
}

export class ScappleRenderError extends ScappleError {

  constructor(
    message: string,
    code: ScappleErrorCode = "RENDER_SVG_FAILED",
    context: Record<string, unknown> = {}
  ) {
    super(message, code, context);
    this.name = "ScappleRenderError";
  }
}
