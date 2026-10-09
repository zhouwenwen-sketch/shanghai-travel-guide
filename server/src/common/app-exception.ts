import { HttpException, HttpStatus } from '@nestjs/common'

export class AppException extends HttpException {
  constructor(
    readonly code: number,
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message, code as HttpStatus)
  }
}
