
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';  
import { moneyTransferCompanyService } from './moneyTransferCompany.service';
import sendResponse from '../../utils/sendResponse';


const createMoneyTransferCompany = catchAsync(async (req: Request, res: Response) => {
 const result = await moneyTransferCompanyService.createMoneyTransferCompany(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'MoneyTransferCompany created successfully',
    data: result,
  });

});

const getAllMoneyTransferCompany = catchAsync(async (req: Request, res: Response) => {

 const result = await moneyTransferCompanyService.getAllMoneyTransferCompany(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All moneyTransferCompany fetched successfully',
    data: result,
  });

});

const getMoneyTransferCompanyById = catchAsync(async (req: Request, res: Response) => {
 const result = await moneyTransferCompanyService.getMoneyTransferCompanyById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'MoneyTransferCompany fetched successfully',
    data: result,
  });

});
const updateMoneyTransferCompany = catchAsync(async (req: Request, res: Response) => {
const result = await moneyTransferCompanyService.updateMoneyTransferCompany(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'MoneyTransferCompany updated successfully',
    data: result,
  });

});


const deleteMoneyTransferCompany = catchAsync(async (req: Request, res: Response) => {
 const result = await moneyTransferCompanyService.deleteMoneyTransferCompany(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'MoneyTransferCompany deleted successfully',
    data: result,
  });

});

export const moneyTransferCompanyController = {
  createMoneyTransferCompany,
  getAllMoneyTransferCompany,
  getMoneyTransferCompanyById,
  updateMoneyTransferCompany,
  deleteMoneyTransferCompany,
};