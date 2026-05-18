import { Request, Response } from 'express';
import { ContactMessage } from '../models/ContactMessage.model';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export const submitContact = catchAsync(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  const contact = await ContactMessage.create({
    name,
    email,
    subject,
    message,
    ipAddress: req.ip,
  });

  return ApiResponse.created(res, { id: contact._id }, 'Message sent successfully. We will get back to you soon.');
});
