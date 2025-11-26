import { Test, TestingModule } from '@nestjs/testing';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('FormsController', () => {
  let controller: FormsController;
  let service: FormsService;

  const mockFormsService = {
    createForm: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    updateForm: jest.fn(),
    deleteForm: jest.fn(),
    submitResponseWithFiles: jest.fn(),
    getFormResponses: jest.fn(),
    getUserForms: jest.fn(),
    deleteResponse: jest.fn(),
    generateFormQrCode: jest.fn(),
  };

  const mockJwtGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormsController],
      providers: [
        { provide: FormsService, useValue: mockFormsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    controller = module.get<FormsController>(FormsController);
    service = module.get<FormsService>(FormsService);

    jest.clearAllMocks();
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ✅ Create form
  describe('create', () => {
    it('should create a form successfully', async () => {
      const req = { user: { id: 1 } };
      const dto = { title: 'New Form' };
      const created = { id: 1, ...dto };

      mockFormsService.createForm.mockResolvedValue(created);

      const result = await controller.create(req, dto);

      expect(service.createForm).toHaveBeenCalledWith(req.user, dto);
      expect(result).toEqual(created);
    });

    it('should throw HttpException on error', async () => {
      mockFormsService.createForm.mockRejectedValue(new Error('Failed'));

      await expect(controller.create({ user: {} }, {})).rejects.toThrow(HttpException);
    });
  });


  describe('findAll', () => {
    it('should return all forms for user', async () => {
      const req = { user: { id: 1 } };
      const forms = [{ id: 1, title: 'Form 1' }];
      mockFormsService.findAll.mockResolvedValue(forms);

      const result = await controller.findAll(req);

      expect(result).toEqual(forms);
      expect(service.findAll).toHaveBeenCalledWith(req.user);
    });
  });


  describe('findOneBySlug', () => {
    it('should return form by slug', async () => {
      const form = { id: 1, slug: 'test-form' };
      mockFormsService.findOne.mockResolvedValue(form);

      const result = await controller.findOneBySlug('test-form');
      expect(result).toEqual(form);
    });

    it('should throw HttpException if form not found', async () => {
      mockFormsService.findOne.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOneBySlug('wrong')).rejects.toThrow(HttpException);
    });
  });


  describe('findOneById', () => {
    it('should return form by id', async () => {
      const form = { id: '1', title: 'Sample' };
      const req = { user: { id: 1 } };
      mockFormsService.findById.mockResolvedValue(form);

      const result = await controller.findOneById('1', req);
      expect(result).toEqual(form);
    });
  });

 
  describe('update', () => {
    it('should update form successfully', async () => {
      const id = '1';
      const dto = { title: 'Updated Form' };
      const req = { user: { id: 1 } };
      const updated = { id, ...dto };
      mockFormsService.updateForm.mockResolvedValue(updated);

      const result = await controller.update(id, dto, req);

      expect(service.updateForm).toHaveBeenCalledWith(id, dto, req.user);
      expect(result).toEqual(updated);
    });
  });


  describe('remove', () => {
    it('should delete form successfully', async () => {
      const id = '1';
      const req = { user: { id: 1 } };
      const response = { message: 'Deleted' };

      mockFormsService.deleteForm.mockResolvedValue(response);

      const result = await controller.remove(id, req);
      expect(result).toEqual(response);
    });
  });

  
  describe('submitPublic', () => {
    it('should submit form with files successfully', async () => {
      const slug = 'public-form';
      const files = [{ originalname: 'file1.png' }];
      const req = { body: { name: 'Sathish' } };
      const response = { message: 'Submitted' };

      mockFormsService.submitResponseWithFiles.mockResolvedValue(response);

      const result = await controller.submitPublic(slug, files as any, req);

      expect(service.submitResponseWithFiles).toHaveBeenCalledWith(slug, req.body, files);
      expect(result).toEqual(response);
    });

    it('should throw HttpException on failure', async () => {
      mockFormsService.submitResponseWithFiles.mockRejectedValue(new Error('Error'));
      await expect(controller.submitPublic('slug', [], { body: {} })).rejects.toThrow(
        HttpException,
      );
    });
  });


  describe('getResponses', () => {
    it('should return form responses', async () => {
      const req = { user: { id: 1 } };
      const responses = [{ id: 1, answer: 'Yes' }];

      mockFormsService.getFormResponses.mockResolvedValue(responses);

      const result = await controller.getResponses('1', req);
      expect(result).toEqual(responses);
    });
  });


  describe('getUserForms', () => {
    it('should return user-created forms', async () => {
      const req = { user: { id: 1 } };
      const forms = [{ id: 1, title: 'My Form' }];
      mockFormsService.getUserForms.mockResolvedValue(forms);

      const result = await controller.getUserForms(req);
      expect(result).toEqual(forms);
    });
  });


  describe('deleteResponse', () => {
    it('should delete specific response', async () => {
      const response = { message: 'Deleted' };
      const req = { user: { id: 1 } };
      mockFormsService.deleteResponse.mockResolvedValue(response);

      const result = await controller.deleteResponse('1', req);
      expect(result).toEqual(response);
    });
  });


  describe('generateQrCode', () => {
    it('should generate QR code', async () => {
      const req = { user: { id: 1 } };
      const qr = { qrCode: 'base64string' };
      mockFormsService.generateFormQrCode.mockResolvedValue(qr);

      const result = await controller.generateQrCode('1', req);
      expect(result).toEqual(qr);
    });

    it('should throw HttpException on failure', async () => {
      mockFormsService.generateFormQrCode.mockRejectedValue(new Error('Error'));
      await expect(controller.generateQrCode('1', { user: {} })).rejects.toThrow(HttpException);
    });
  });
});
