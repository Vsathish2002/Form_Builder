import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form } from './entities/form.entity';
import { FormField, FieldType } from './entities/formField.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormResponse } from './entities/formResponse.entity';
import { FormResponseItem } from './entities/formResponseItem.entity';
import { User } from '../users/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { QrCodeService } from '../qrcode/qrcode.service';
import { ResponseGateway } from '../gateway/response.gateway';
import { In } from 'typeorm';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form) private formsRepo: Repository<Form>,
    @InjectRepository(FormResponse) private responsesRepo: Repository<FormResponse>,
    @InjectRepository(FormField) private fieldsRepo: Repository<FormField>,
    @InjectRepository(FormResponseItem) private itemsRepo: Repository<FormResponseItem>,
    private qrCodeService: QrCodeService,
    private responseGateway: ResponseGateway,
  ) { }

  // Create a new form
  async createForm(owner: User, dto: CreateFormDto): Promise<Form> {
    const form = this.formsRepo.create({
      title: dto.title,
      description: dto.description,
      isPublic: dto.isPublic ?? false,
      slug: uuidv4(),
      owner,
    });

    // Map DTO fields to FormField entities safely
    form.fields = (dto.fields || []).map(f =>
      this.fieldsRepo.create({
        label: f.label,
        type: f.type as FieldType,
        required: f.required ?? false,
        options: f.options || [],
        order: f.order || 0,
        validation: f.validation || null,
        form,
      }),
    );

    return this.formsRepo.save(form);
  }

  // Get all forms

  async findAll(user: User): Promise<Form[]> {
    if (user.role.name === 'admin') {
      // Admin sees all forms
      return this.formsRepo.find({ relations: ['fields', 'owner'] });
    } else {
      // Normal users see only their forms
      return this.formsRepo.find({
        where: { owner: { id: user.id } },
        relations: ['fields', 'owner'],
      });
    }
  }
  //old  async findAll(): Promise<Form[]> {
  //   return this.formsRepo.find({ relations: ['fields', 'owner'] });
  // }

  // Get a form by slug
  async findOne(slug: string): Promise<Form> {
    const form = await this.formsRepo.findOne({
      where: { slug },
      relations: ['fields', 'owner'],
    });
    if (!form) throw new NotFoundException('Form not found');
    return form;
  }

  // Get a form by ID (for editing)
  async findById(id: string, user: User): Promise<Form> {
    const form = await this.formsRepo.findOne({
      where: { id },
      relations: ['fields', 'owner'],
    });
    if (!form) throw new NotFoundException('Form not found');

    // Check ownership or public access
    if (form.owner?.id !== user.id && user.role.name !== 'admin' && !form.isPublic) {
      throw new NotFoundException('Form not found');
    }

    return form;
  }

  // Update form
  async updateForm(id: string, dto: UpdateFormDto, user: User): Promise<Form> {
    const form = await this.formsRepo.findOne({
      where: { id },
      relations: ['fields', 'owner'],
    });
    if (!form) throw new NotFoundException('Form not found');

    // Ownership check
    if (form.owner?.id !== user.id && user.role.name !== 'admin') {
      throw new NotFoundException('Form not found');
    }

    // Update metadata
    form.title = dto.title ?? form.title;
    form.description = dto.description ?? form.description;
    form.isPublic = dto.isPublic ?? form.isPublic;

    // Delete old fields before recreating
    await this.fieldsRepo.delete({ form: { id: form.id } });

    const newFields = (dto.fields || []).map(f =>
      this.fieldsRepo.create({
        label: f.label,
        type: f.type as FieldType,
        required: f.required ?? false,
        options: f.options || [],
        order: f.order || 0,
        validation: f.validation || null,
        form,
      }),
    );

    await this.fieldsRepo.save(newFields);
    form.fields = newFields;

    return this.formsRepo.save(form);
  }

  // old async updateForm(id: string, dto: UpdateFormDto, user: User): Promise<Form> {
  //   const form = await this.formsRepo.findOne({ where: { id }, relations: ['fields', 'owner'] });
  //   if (!form) throw new NotFoundException('Form not found');

  //   // Check ownership
  //   if (form.owner?.id !== user.id && user.role.name !== 'admin') {
  //     throw new NotFoundException('Form not found');
  //   }

  //   let hasChanges = false;

  //   // Update basic properties
  //   if (dto.title !== undefined && dto.title !== form.title) {
  //     form.title = dto.title;
  //     hasChanges = true;
  //   }
  //   if (dto.description !== undefined && dto.description !== form.description) {
  //     form.description = dto.description;
  //     hasChanges = true;
  //   }
  //   if (dto.isPublic !== undefined && dto.isPublic !== form.isPublic) {
  //     form.isPublic = dto.isPublic;
  //     hasChanges = true;
  //   }

  //   // Handle fields update: delete old fields and create new ones
  //   if (dto.fields !== undefined) {
  //     // Delete old fields
  //     if (form.fields.length > 0) await this.fieldsRepo.remove(form.fields);

  //     // Create new fields
  //     const newFields = dto.fields.map(f =>
  //       this.fieldsRepo.create({
  //         label: f.label,
  //         type: f.type as FieldType,
  //         required: f.required ?? false,
  //         options: f.options || [],
  //         order: f.order || 0,
  //         validation: f.validation || null,
  //         form,
  //       }),
  //     );

  //     // Save new fields
  //     await this.fieldsRepo.save(newFields);
  //     form.fields = newFields;

  //     hasChanges = true; // mark that we have updates
  //   }

  //   // Only save the form if something actually changed
  //   if (hasChanges) {
  //     return this.formsRepo.save(form);
  //   }

  //   return form;
  // }

  // Delete form
  async deleteForm(id: string, user: User): Promise<void> {
    const form = await this.formsRepo.findOne({ where: { id }, relations: ['owner'] });
    if (!form) throw new NotFoundException('Form not found');

    // Check ownership
    if (form.owner?.id !== user.id && user.role.name !== 'admin') {
      throw new NotFoundException('Form not found');
    }

    await this.formsRepo.delete(id);
  }

  // Submit form response by slug
  async submitResponse(
    formSlug: string,
    answers: { fieldId: string; value: string }[],
  ): Promise<FormResponse> {
    const form = await this.findOne(formSlug);

    const response = this.responsesRepo.create({ form });
    await this.responsesRepo.save(response); // save parent first

    const fieldIds = answers.map(a => a.fieldId);
    const fields = await this.fieldsRepo.findBy({ id: In(fieldIds) });

    response.items = answers.map(a => {
      const field = fields.find(f => f.id === a.fieldId);
      if (!field) throw new NotFoundException(`Field ${a.fieldId} not found`);
      return this.itemsRepo.create({
        field,
        value: a.value,
        response,
      });
    });

    await this.itemsRepo.save(response.items); // save children separately

    try {
      this.responseGateway.broadcastNewResponse({
        formId: form.id,
        formTitle: form.title,
        responseId: response.id,
        totalAnswers: answers.length,
        submittedAt: new Date(),
      });
    } catch (err) {
      console.error('WebSocket broadcast failed:', err.message);
    }

    return response;
  }

  //   formSlug: string,
  //   answers: { fieldId: string; value: string }[],
  // ): Promise<FormResponse> {
  //   const form = await this.findOne(formSlug);

  //   const response = this.responsesRepo.create({ form });

  //   // Fetch actual fields from DB to avoid relation issues
  //   const fieldIds = answers.map(a => a.fieldId);
  //   const fields = await this.fieldsRepo.findByIds(fieldIds);

  //   response.items = answers.map(a => {
  //     const field = fields.find(f => f.id === a.fieldId);
  //     if (!field) throw new NotFoundException(`Field ${a.fieldId} not found`);
  //     return this.itemsRepo.create({
  //       field,
  //       value: a.value,
  //       response,
  //     });
  //   });

  //   const savedResponse = await this.responsesRepo.save(response);

  //   // Wrap WebSocket broadcast in try/catch
  //   try {
  //     this.responseGateway.broadcastNewResponse({
  //       formId: form.id,
  //       formTitle: form.title,
  //       responseId: savedResponse.id,
  //       totalAnswers: answers.length,
  //       submittedAt: new Date(),
  //     });
  //   } catch (err) {
  //     console.error('WebSocket broadcast failed:', err.message);
  //   }

  //   return savedResponse;
  // }
  //old one  async submitResponse(formSlug: string, answers: { fieldId: string; value: string }[]): Promise<FormResponse> {
  //   const form = await this.findOne(formSlug);
  //   const response = this.responsesRepo.create({ form });

  //   response.items = answers.map((a) =>
  //     this.itemsRepo.create({
  //       field: { id: a.fieldId } as FormField,
  //       value: a.value,
  //       response,
  //     }),
  //   ); 

  //   const savedResponse = await this.responsesRepo.save(response);

  //   // Broadcast new response via WebSocket
  //   this.responseGateway.broadcastNewResponse({
  //     formId: form.id,
  //     formTitle: form.title,
  //     responseId: savedResponse.id,
  //     totalAnswers: answers.length,
  //     submittedAt: new Date(),
  //   });

  //   return savedResponse;
  // }




  // Get form responses
  async getFormResponses(formId: string, user: User): Promise<FormResponse[]> {
    const form = await this.formsRepo.findOne({ where: { id: formId }, relations: ['owner'] });
    if (!form) throw new NotFoundException('Form not found');

    // Check ownership
    if (form.owner?.id !== user.id && user.role.name !== 'admin') {
      throw new NotFoundException('Form not found');
    }

    return this.responsesRepo.find({
      where: { form: { id: formId } },
      relations: ['items', 'items.field'],
    });
  }

  // Get user's forms
  async getUserForms(user: User): Promise<Form[]> {
    return this.formsRepo.find({
      where: { owner: { id: user.id } },
      relations: ['fields'],
    });
  }

  // Generate QR code for form
  async generateFormQrCode(formId: string, user: User): Promise<string> {
    const form = await this.formsRepo.findOne({ where: { id: formId }, relations: ['owner'] });
    if (!form) throw new NotFoundException('Form not found');

    // Check ownership
    if (form.owner?.id !== user.id && user.role.name !== 'admin') {
      throw new NotFoundException('Form not found');
    }

    const formUrl = `http://localhost:3000/public/${form.slug}`;
    return this.qrCodeService.generateQrCode(formUrl);
  }
}
