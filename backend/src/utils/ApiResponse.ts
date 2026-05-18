import { Response } from 'express';
import { IApiResponse, IPaginatedResponse } from '../types';

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: Record<string, unknown>
  ): Response {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  static paginated<T>(
    res: Response,
    result: IPaginatedResponse<T>,
    message = 'Success'
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data: result.data,
      pagination: result.pagination,
    });
  }

  static error(
    res: Response,
    message = 'An error occurred',
    statusCode = 500,
    errors?: Record<string, string[]>
  ): Response {
    const response: IApiResponse = {
      success: false,
      message,
      ...(errors && { errors }),
    };
    return res.status(statusCode).json(response);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
