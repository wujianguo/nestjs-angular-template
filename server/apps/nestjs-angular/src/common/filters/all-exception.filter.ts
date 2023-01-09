import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

interface ExceptionObject {
  statusCode: number;

  message: object;

  error: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    if (exception instanceof HttpException) {
      const httpError = exception as HttpException;
      // console.error(httpError);
      let message = '';
      if (httpError.getResponse() instanceof String) {
        message = httpError.getResponse() as string;
      } else if (httpError.getResponse() instanceof Object) {
        try {
          message = (httpError.getResponse() as ExceptionObject).message.toString();
        } catch (error) {
          message = 'Internal server error';
        }
      }
      const resp = {
        code: httpError.getStatus(),
        message: message,
        detail: httpError.getResponse(),
      };
      httpAdapter.reply(ctx.getResponse(), resp, httpError.getStatus());
    } else {
      const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      // console.error(exception);
      let message = '';
      try {
        message = exception.toString();
      } catch (error) {
        message = 'Internal server error';
      }
      const responseBody = {
        code: httpStatus,
        // message: 'Internal server error',
        message: message,
        detail: exception,
      };
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
  }
}
