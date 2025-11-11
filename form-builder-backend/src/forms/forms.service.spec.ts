import { Test, TestingModule } from '@nestjs/testing';
import { FormsService } from './forms.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { FormResponse } from './entities/formResponse.entity';
import { FormField } from './entities/formField.entity';
import { QrCodeService } from '../qrcode/qrcode.service';
import { ResponseGateway } from '../gateway/response.gateway';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({ v4: jest.fn(() => 'mock-uuid') }));

describe('FormsService', () => {
  let service: FormsService;
  let formsRepo: jest.Mocked<Repository<Form>>;
  let responsesRepo: jest.Mocked<Repository<FormResponse>>;
  let fieldsRepo: jest.Mocked<Repository<FormField>>;
  let qrCodeService: jest.Mocked<QrCodeService>;
  let responseGateway: jest.Mocked<ResponseGateway>;

  const mockUser = { id: '1', role: { name: 'user' } } as any;
  const adminUser = { id: '2', role: { name: 'admin' } } as any;

  const mockForm = {
    id: 'f1',
    slug: 'mock-slug',
    title: 'Test Form',
    description: 'desc',
    owner: mockUser,
    status: 'Active',
    fields: [],
  } as Form;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormsService,
        { provide: getRepositoryToken(Form), useValue: createMockRepo() },
        { provide: getRepositoryToken(FormResponse), useValue: createMockRepo() },
        { provide: getRepositoryToken(FormField), useValue: createMockRepo() },
        { provide: QrCodeService, useValue: { generateQrCode: jest.fn() } },
        { provide: ResponseGateway, useValue: { broadcastNewResponse: jest.fn() } },
      ],
    }).compile();

    service = module.get(FormsService);
    formsRepo = module.get(getRepositoryToken(Form));
    responsesRepo = module.get(getRepositoryToken(FormResponse));
    fieldsRepo = module.get(getRepositoryToken(FormField));
    qrCodeService = module.get(QrCodeService);
    responseGateway = module.get(ResponseGateway);

    jest.clearAllMocks();
  });

  function createMockRepo() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
    };
  }

  // ✅ 1. createForm
  describe('createForm', () => {
    it('should create form successfully', async () => {
      const dto = { title: 'Form 1', fields: [{ label: 'Name', type: 'text' }] };
      formsRepo.create.mockReturnValue(mockForm);
      fieldsRepo.create.mockReturnValue([{ id: 'fld1', label: 'Name' } as FormField]);
      fieldsRepo.save.mockResolvedValue([{ id: 'fld1', label: 'Name' } as FormField]);
      formsRepo.save.mockResolvedValue(mockForm);

      const result = await service.createForm(mockUser, dto as any);

      expect(formsRepo.create).toHaveBeenCalled();
      expect(fieldsRepo.save).toHaveBeenCalled();
      expect(formsRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockForm);
    });
  });

  // ✅ 2. findAll
  describe('findAll', () => {
    it('should return all forms for admin', async () => {
      const forms = [mockForm];
      formsRepo.find.mockResolvedValue(forms);

      const result = await service.findAll(adminUser);
      expect(result).toEqual(forms);
    });

    it('should return only user forms for non-admin', async () => {
      const forms = [mockForm];
      formsRepo.find.mockResolvedValue(forms);

      const result = await service.findAll(mockUser);
      expect(result).toEqual(forms);
    });
  });

  // ✅ 3. findOne
  describe('findOne', () => {
    it('should return form by slug', async () => {
      formsRepo.findOne.mockResolvedValue(mockForm);
      const result = await service.findOne('mock-slug');
      expect(result).toEqual(mockForm);
    });

    it('should throw NotFound if not found', async () => {
      formsRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFound if form inactive', async () => {
      formsRepo.findOne.mockResolvedValue({ ...mockForm, status: 'Inactive' });
      await expect(service.findOne('mock-slug')).rejects.toThrow(NotFoundException);
    });
  });

  // ✅ 4. findById
  describe('findById', () => {
    it('should return form if owner', async () => {
      formsRepo.findOne.mockResolvedValue(mockForm);
      const result = await service.findById('f1', mockUser);
      expect(result).toEqual(mockForm);
    });

    it('should allow admin', async () => {
      formsRepo.findOne.mockResolvedValue(mockForm);
      const result = await service.findById('f1', adminUser);
      expect(result).toEqual(mockForm);
    });

    it('should throw NotFound if unauthorized', async () => {
      formsRepo.findOne.mockResolvedValue({ ...mockForm, owner: { id: '999' } });
      await expect(service.findById('f1', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  // ✅ 5. updateForm
  describe('updateForm', () => {
    it('should update and save form successfully', async () => {
      const dto = { title: 'Updated', fields: [{ id: '1', label: 'New Field', type: 'text' }] };
      formsRepo.findOne.mockResolvedValue({ ...mockForm, fields: [] });
      fieldsRepo.save.mockResolvedValue([{ id: '1', label: 'New Field' }]);
      formsRepo.save.mockResolvedValue(mockForm);

      const result = await service.updateForm('f1', dto as any, mockUser);
      expect(formsRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockForm);
    });

    it('should throw NotFound if form not found', async () => {
      formsRepo.findOne.mockResolvedValue(null);
      await expect(service.updateForm('invalid', {} as any, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ✅ 6. deleteForm
  describe('deleteForm', () => {
    it('should delete form if owner', async () => {
      formsRepo.findOne.mockResolvedValue(mockForm);
      formsRepo.delete.mockResolvedValue({} as any);
      await service.deleteForm('f1', mockUser);
      expect(formsRepo.delete).toHaveBeenCalledWith('f1');
    });

    it('should throw NotFound if not found', async () => {
      formsRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteForm('id', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  // ✅ 7. submitResponseWithFiles
  describe('submitResponseWithFiles', () => {
    it('should submit response successfully', async () => {
      const slug = 'mock-slug';
      const formData = { field1: 'value1' };
      const files = [{ fieldname: 'file1', filename: 'f1.png' }] as any;
      const newResponse = { id: 'r1' };

      formsRepo.findOne.mockResolvedValue(mockForm);
      responsesRepo.create.mockReturnValue(newResponse as any);
      responsesRepo.save.mockResolvedValue(newResponse as any);

      const result = await service.submitResponseWithFiles(slug, formData, files);

      expect(responsesRepo.create).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Response saved successfully', id: 'r1' });
    });

    it('should throw BadRequestException if form not found', async () => {
      formsRepo.findOne.mockResolvedValue(null);
      await expect(
        service.submitResponseWithFiles('bad-slug', {}, []),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ✅ 8. getFormResponses
  describe('getFormResponses', () => {
    it('should return responses for owner', async () => {
      formsRepo.findOne.mockResolvedValue(mockForm);
      responsesRepo.find.mockResolvedValue([{ id: 'r1' }] as any);

      const result = await service.getFormResponses('f1', mockUser);
      expect(result).toEqual([{ id: 'r1' }]);
    });

    it('should throw NotFound if unauthorized', async () => {
      formsRepo.findOne.mockResolvedValue({ ...mockForm, owner: { id: '99' } });
      await expect(service.getFormResponses('f1', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  // ✅ 9. getUserForms
  describe('getUserForms', () => {
    it('should return forms for user', async () => {
      formsRepo.find.mockResolvedValue([mockForm]);
      const result = await service.getUserForms(mockUser);
      expect(result).toEqual([mockForm]);
    });
  });

  // ✅ 10. deleteResponse
  describe('deleteResponse', () => {
    it('should delete response if owner', async () => {
      const response = { id: 'r1', form: { owner: mockUser } };
      responsesRepo.findOne.mockResolvedValue(response as any);
      await service.deleteResponse('r1', mockUser);
      expect(responsesRepo.delete).toHaveBeenCalledWith('r1');
    });

    it('should throw NotFound if not found', async () => {
      responsesRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteResponse('x', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  // ✅ 11. generateFormQrCode
  describe('generateFormQrCode', () => {
    it('should return QR code URL', async () => {
      formsRepo.findOne.mockResolvedValue(mockForm);
      qrCodeService.generateQrCode.mockResolvedValue('mock-qr');
      const result = await service.generateFormQrCode('f1', mockUser);
      expect(result).toBe('mock-qr');
    });

    it('should throw NotFound if form not found', async () => {
      formsRepo.findOne.mockResolvedValue(null);
      await expect(service.generateFormQrCode('id', mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
