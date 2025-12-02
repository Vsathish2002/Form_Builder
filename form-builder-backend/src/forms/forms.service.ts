import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Form } from './entities/form.entity';
import { FormField, FieldType } from './entities/formField.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormResponse } from './entities/formResponse.entity';
import { User } from '../users/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { QrCodeService } from '../qrcode/qrcode.service';
import { ResponseGateway } from '../gateway/response.gateway';
import { EmailService } from '../auth/email.service';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form) private formsRepo: Repository<Form>,
    @InjectRepository(FormResponse) private responsesRepo: Repository<FormResponse>,
    @InjectRepository(FormField) private fieldsRepo: Repository<FormField>,
    private qrCodeService: QrCodeService,
    private responseGateway: ResponseGateway,
    private emailService: EmailService,
  ) { }

  // --- 🧩 Normalize frontend field types for DB enum ---
  private normalizeFieldType(type: string): FieldType {
    const map: Record<string, FieldType> = {
      'checkbox-group': 'checkbox',
      'radio-group': 'radio',
      'Paragraph': 'paragraph',
      'Header': 'header',
      'Text': 'text',
      'TextArea': 'textarea',
      'Number': 'number',
      'Date': 'date',
      'Select': 'select',
      'Email': 'text', // Email as text type
      'Phone': 'text', // Phone as text type
      'URL': 'text',   // URL as text type
      'Hidden': 'text', // Hidden as text type
      'section': 'section',
      'page': 'page',
      'autocomplete': 'autocomplete',
    };
    return (map[type] || type) as FieldType;
  }

  // --- 🆕 Create Form ---
  async createForm(owner: User, dto: CreateFormDto): Promise<Form> {
    const form = this.formsRepo.create({
      title: dto.title,
      description: dto.description,
      isPublic: dto.isPublic ?? false,
      slug: uuidv4(),
      owner,
      status: dto.status ?? 'Active',
    });

    const savedForm = await this.formsRepo.save(form);

    if (dto.fields && dto.fields.length > 0) {
      const fieldDefinitions = dto.fields.map((f) => {
        // Clean up options to prevent empty values
        const cleanOptions = (f.options || []).map((opt: any, index: number) => {
          if (typeof opt === 'object' && opt !== null) {
            return {
              ...opt,
              value: opt.value && opt.value.toString().trim() !== ''
                ? opt.value
                : opt.label && opt.label.toString().trim() !== ''
                  ? opt.label
                  : `option-${index}`,
              label: opt.label || opt.value || `Option ${index + 1}`
            };
          } else {
            return opt && opt.toString().trim() !== ''
              ? opt
              : `option-${index}`;
          }
        });

        return {
          id: uuidv4(),
          label: f.label,
          type: this.normalizeFieldType(f.type),
          required: f.required ?? false,
          options: cleanOptions,
          order: f.order || 0,
          validation: f.validation || null,
          extraValue: f.extraValue ?? undefined,
          subtype: f.subtype ?? undefined,
        };   
      });

      const formFieldEntity = this.fieldsRepo.create({
        form: savedForm,
        fields: fieldDefinitions,
      });

      savedForm.fields = [await this.fieldsRepo.save(formFieldEntity)];
    }

    return savedForm;
  }

  // --- 📋 Get All Forms ---
  async findAll(user: User): Promise<Form[]> {
    if (user.role.name === 'admin') {
      return this.formsRepo.find({ relations: ['fields', 'owner'] });
    }
    return this.formsRepo.find({
      where: { owner: { id: user.id } },
      relations: ['fields', 'owner'],
    });
  }
  // 👑 ADMIN: Get all forms from all users //new for admin_dashboard
  async findAllAdmin(): Promise<Form[]> {
    return this.formsRepo.find({
      relations: ['fields', 'owner'],
      order: { createdAt: 'DESC' },
    });
  }

  // --- 🔍 Find Form by Slug ---
  async findOne(slug: string): Promise<Form> {
    const form = await this.formsRepo.findOne({
      where: { slug },
      relations: ['fields', 'owner'],
    });
    if (!form) throw new NotFoundException('Form not found');

    if (form.status !== 'Active') throw new NotFoundException('Form not found');
    return form;
  }

  // --- 🔍 Find by ID (secure) ---
  async findById(id: string, user: User): Promise<Form> {
    const form = await this.formsRepo.findOne({
      where: { id },
      relations: ['fields', 'owner'],
    });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin' && !form.isPublic)
      throw new NotFoundException('Form not found');
    return form;
  }

  async updateForm(id: string, dto: UpdateFormDto, user: User): Promise<Form> {
    const form = await this.formsRepo.findOne({
      where: { id },
      relations: ['fields', 'owner'],
    });

    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin')
      throw new NotFoundException('Form not found');

    // ✅ Update simple properties safely
    form.title = dto.title ?? form.title;
    form.description = dto.description ?? form.description;
    form.isPublic = dto.isPublic ?? form.isPublic;
    form.status = dto.status ?? form.status;

    // ✅ Only update fields if they are explicitly provided (not empty array)
    // This prevents clearing fields when only updating status
    if (dto.fields && dto.fields.length > 0) {
      const fieldDefinitions = dto.fields.map((f) => {
        // Clean up options to prevent empty values
        const cleanOptions = (f.options || []).map((opt: any, index: number) => {
          if (typeof opt === 'object' && opt !== null) {
            return {
              ...opt,
              value: opt.value && opt.value.toString().trim() !== ''
                ? opt.value
                : opt.label && opt.label.toString().trim() !== ''
                  ? opt.label
                  : `option-${index}`,
              label: opt.label || opt.value || `Option ${index + 1}`
            };
          } else {
            return opt && opt.toString().trim() !== ''
              ? opt
              : `option-${index}`;
          }
        });
        return {
          id: f.id || uuidv4(),
          label: f.label,
          type: this.normalizeFieldType(f.type),
          required: f.required ?? false,
          options: cleanOptions,
          order: f.order || 0,
          validation: f.validation || null,
          extraValue: f.extraValue ?? undefined,
          subtype: f.subtype ?? undefined,
        };
      });

      if (form.fields && form.fields.length > 0) {
        // Update existing FormField record
        form.fields[0].fields = fieldDefinitions;
        await this.fieldsRepo.save(form.fields[0]);
      } else {
        // Create new FormField record
        const formFieldEntity = this.fieldsRepo.create({
          form,
          fields: fieldDefinitions,
        });
        form.fields = [await this.fieldsRepo.save(formFieldEntity)];
      }
    }
    // If dto.fields is not provided or is empty, DO NOT modify existing fields
    // This preserves form fields when only updating status

    return await this.formsRepo.save(form);
  }

  async deleteForm(id: string, user: User): Promise<void> {
    const form = await this.formsRepo.findOne({ where: { id }, relations: ['owner'] });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin')
      throw new NotFoundException('Form not found');
    await this.formsRepo.delete(id);
  }
  async submitResponseWithFiles(
    slug: string,
    formData: Record<string, any>,
    files: Express.Multer.File[],
  ) {
    const form = await this.formsRepo.findOne({
      where: { slug },
      relations: ['fields', 'owner'],
    });
    if (!form) throw new BadRequestException('Form not found');

    if (files && files.length > 0) {
      files.forEach((file) => {
        if (file && file.filename) {
          formData[file.fieldname] = `/uploads/${file.filename}`;
        } else {
          console.warn('⚠️ Skipped file with no filename:', file);
        }
      });
    }

    const newResponse = this.responsesRepo.create({
      form,
      responseData: formData,
    });
    await this.responsesRepo.save(newResponse);

    // 📧 Send email notification to form owner
    try {
      if (form.owner && form.owner.email) {
        // Always send email notification for form submissions
        await this.emailService.sendFormSubmissionNotification(
          form.owner.email,
          form.title,
          form.id,
          new Date()
        );
        console.log('Email notification sent successfully');
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue with the response even if email fails
    }

    this.responseGateway.broadcastNewResponse({
      formId: form.id,
      formTitle: form.title,
      responseId: newResponse.id,
      totalAnswers: Object.keys(formData).length,
      submittedAt: new Date(),
      answers: Object.entries(formData).map(([key, value]) => ({
        label: key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      })),
    });

    return { message: 'Response saved successfully', id: newResponse.id };
  }


  async getFormResponses(formId: string, user: User): Promise<FormResponse[]> {
    const form = await this.formsRepo.findOne({
      where: { id: formId },
      relations: ['owner'],
    });

    if (!form) throw new NotFoundException('Form not found');

    if (form.owner?.id !== user.id && user.role.name !== 'admin') {
      throw new NotFoundException('Form not found');
    }


    return this.responsesRepo.find({
      where: { form: { id: formId } },
      order: { createdAt: 'ASC' },
    });
  }



  async getUserForms(user: User): Promise<Form[]> {
    return this.formsRepo.find({
      where: { owner: { id: user.id } },
      relations: ['fields'],
    });
  }


  async deleteResponse(responseId: string, user: User): Promise<void> {
    const response = await this.responsesRepo.findOne({
      where: { id: responseId },
      relations: ['form', 'form.owner'],
    });
    if (!response) throw new NotFoundException('Response not found');
    if (response.form.owner?.id !== user.id && user.role.name !== 'admin')
      throw new NotFoundException('Response not found');
    await this.responsesRepo.delete(responseId);
  }


  async generateFormQrCode(formId: string, user: User): Promise<string> {
    const form = await this.formsRepo.findOne({ where: { id: formId }, relations: ['owner'] });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin')
      throw new NotFoundException('Form not found');

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const formUrl = `${frontendUrl}/public/${form.slug}`;
    return this.qrCodeService.generateQrCode(formUrl);
    // "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }

}