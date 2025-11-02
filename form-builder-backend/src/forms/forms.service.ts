import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form) private formsRepo: Repository<Form>,
    @InjectRepository(FormResponse) private responsesRepo: Repository<FormResponse>,
    @InjectRepository(FormField) private fieldsRepo: Repository<FormField>,
    @InjectRepository(FormResponseItem) private itemsRepo: Repository<FormResponseItem>,
    private qrCodeService: QrCodeService,
    private responseGateway: ResponseGateway,
  ) {}

  // --- Create form ---
  async createForm(owner: User, dto: CreateFormDto): Promise<Form> {
    const form = this.formsRepo.create({
      title: dto.title,
      description: dto.description,
      isPublic: dto.isPublic ?? false,
      slug: uuidv4(),
      owner,
    });

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

  // --- Find all forms ---
  async findAll(user: User): Promise<Form[]> {
    if (user.role.name === 'admin') {
      return this.formsRepo.find({ relations: ['fields', 'owner'] });
    }
    return this.formsRepo.find({
      where: { owner: { id: user.id } },
      relations: ['fields', 'owner'],
    });
  }

  // --- Find form by slug ---
  async findOne(slug: string): Promise<Form> {
    const form = await this.formsRepo.findOne({
      where: { slug },
      relations: ['fields', 'owner'],
    });
    if (!form) throw new NotFoundException('Form not found');
    return form;
  }

  // --- Find by ID ---
  async findById(id: string, user: User): Promise<Form> {
    const form = await this.formsRepo.findOne({
      where: { id },
      relations: ['fields', 'owner'],
    });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin' && !form.isPublic) {
      throw new NotFoundException('Form not found');
    }
    return form;
  }

  // --- Update form ---
  async updateForm(id: string, dto: UpdateFormDto, user: User): Promise<Form> {
    const form = await this.formsRepo.findOne({ where: { id }, relations: ['fields', 'owner'] });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin') {
      throw new NotFoundException('Form not found');
    }

    form.title = dto.title ?? form.title;
    form.description = dto.description ?? form.description;
    form.isPublic = dto.isPublic ?? form.isPublic;

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

  // --- Delete form ---
  async deleteForm(id: string, user: User): Promise<void> {
    const form = await this.formsRepo.findOne({ where: { id }, relations: ['owner'] });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin') {
      throw new NotFoundException('Form not found');
    }
    await this.formsRepo.delete(id);
  }

  // --- Submit form response with optional files ---
  async submitResponseWithFiles(
    formSlug: string,
    body: any,
    files?: Express.Multer.File[],
  ): Promise<FormResponse> {
    const form = await this.findOne(formSlug);

    const response = this.responsesRepo.create({ form });
    await this.responsesRepo.save(response);

    const answersArray: { fieldId: string; value: string }[] = [];

    // --- Normal fields from body ---
    Object.entries(body || {}).forEach(([fieldId, value]) => {
      answersArray.push({ fieldId, value: String(value) });
    });

    // --- Files (if any) ---
    if (files && files.length > 0) {
      files.forEach((file) => {
        answersArray.push({ fieldId: file.fieldname, value: file.filename });
      });
    }

    const fieldIds = answersArray.map(a => a.fieldId);
    const fields = await this.fieldsRepo.findBy({ id: In(fieldIds) });

    response.items = answersArray.map(a => {
      const field = fields.find(f => f.id === a.fieldId);
      if (!field) throw new NotFoundException(`Field ${a.fieldId} not found`);
      return this.itemsRepo.create({ field, value: a.value, response });
    });

    await this.itemsRepo.save(response.items);

    return response;
  }

  // --- Get form responses ---
  async getFormResponses(formId: string, user: User): Promise<FormResponse[]> {
    const form = await this.formsRepo.findOne({ where: { id: formId }, relations: ['owner'] });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin') {
      throw new NotFoundException('Form not found');
    }
    return this.responsesRepo.find({
      where: { form: { id: formId } },
      relations: ['items', 'items.field'],
    });
  }

  // --- Get user forms ---
  async getUserForms(user: User): Promise<Form[]> {
    return this.formsRepo.find({
      where: { owner: { id: user.id } },
      relations: ['fields'],
    });
  }

  // --- Generate QR code ---
  async generateFormQrCode(formId: string, user: User): Promise<string> {
    const form = await this.formsRepo.findOne({ where: { id: formId }, relations: ['owner'] });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin') {
      throw new NotFoundException('Form not found');
    }
    const formUrl = `http://localhost:5173/public/${form.slug}`;
    // const formUrl = ` http://192.168.0.105:5173/public/${form.slug}`;

    return this.qrCodeService.generateQrCode(formUrl);
  }
}
