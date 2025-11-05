import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Form } from './entities/form.entity';
import { FormField, FieldType } from './entities/formField.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormResponse } from './entities/formResponse.entity';
import { FormResponseItem } from './entities/formResponseItem.entity';
import { FormDraft } from './entities/formDraft.entity';
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
    @InjectRepository(FormDraft) private draftsRepo: Repository<FormDraft>,
    private qrCodeService: QrCodeService,
    private responseGateway: ResponseGateway,
  ) { }

  // --- 🧩 Normalize frontend field types for DB enum ---
  private normalizeFieldType(type: string): FieldType {
    const map: Record<string, FieldType> = {
      'checkbox-group': 'checkbox',
      'radio-group': 'radio',
      Paragraph: 'paragraph',
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

    const fieldEntities = this.fieldsRepo.create(
      (dto.fields || []).map((f) => ({
        label: f.label,
        type: this.normalizeFieldType(f.type),
        required: f.required ?? false,
        options: f.options || [],
        order: f.order || 0,
        validation: f.validation || null,
        extraValue: f.extraValue ?? undefined,
        subtype: f.subtype ?? undefined,
        form,
      })),
    );

    form.fields = await this.fieldsRepo.save(fieldEntities);
    return this.formsRepo.save(form);
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

  // --- ✏️ Update Form ---
  async updateForm(id: string, dto: UpdateFormDto, user: User): Promise<Form> {
    const form = await this.formsRepo.findOne({
      where: { id },
      relations: ['fields', 'owner'],
    });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin')
      throw new NotFoundException('Form not found');

    form.title = dto.title ?? form.title;
    form.description = dto.description ?? form.description;
    form.isPublic = dto.isPublic ?? form.isPublic;
    form.status = dto.status ?? form.status;

    // 🔹 Update existing fields and add new ones
    const incomingFields = dto.fields || [];
    const existingFields = form.fields || [];

    // Map existing fields by id
    const existingMap = new Map();
    existingFields.forEach((ef) => {
      existingMap.set(ef.id, ef);
    });

    const updatedFields: FormField[] = [];

    for (const incoming of incomingFields) {
      const existing = existingMap.get(incoming.id);

      if (existing) {
        // Update existing field
        existing.label = incoming.label;
        existing.type = this.normalizeFieldType(incoming.type);
        existing.required = incoming.required ?? false;
        existing.options = incoming.options || [];
        existing.order = incoming.order || 0;
        existing.validation = incoming.validation || null;
        existing.extraValue = incoming.extraValue ?? undefined;
        existing.subtype = incoming.subtype ?? undefined;
        updatedFields.push(existing);
        existingMap.delete(incoming.id); // Remove from map to avoid deletion
      } else {
        // Create new field
        const newField = this.fieldsRepo.create({
          label: incoming.label,
          type: this.normalizeFieldType(incoming.type),
          required: incoming.required ?? false,
          options: incoming.options || [],
          order: incoming.order || 0,
          validation: incoming.validation || null,
          extraValue: incoming.extraValue ?? undefined,
          subtype: incoming.subtype ?? undefined,
          form,
        });
        updatedFields.push(newField);
      }
    }

    // Delete fields not in incoming
    const toDelete = Array.from(existingMap.values());
    if (toDelete.length > 0) {
      await this.fieldsRepo.remove(toDelete);
    }

    // Save updated and new fields
    form.fields = await this.fieldsRepo.save(updatedFields);
    return this.formsRepo.save(form);
  }

  // --- 🗑 Delete Form ---
  async deleteForm(id: string, user: User): Promise<void> {
    const form = await this.formsRepo.findOne({ where: { id }, relations: ['owner'] });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin')
      throw new NotFoundException('Form not found');
    await this.formsRepo.delete(id);
  }

  // --- 📤 Submit Form with Files ---

  async submitResponseWithFiles(
    slug: string,
    formData: Record<string, any>,
    files: Express.Multer.File[],
  ) {
    const form = await this.formsRepo.findOne({
      where: { slug },
      relations: ['fields'],
    });

    if (!form) throw new BadRequestException('Form not found');

    const answersArray: { fieldId: string; value: string }[] = [];

    // 🟩 1️⃣ Handle text, checkbox, radio, etc.
    Object.entries(formData).forEach(([fieldId, value]) => {
      if (fieldId === 'sessionId') return; // skip
      const field = form.fields.find((f) => f.id === fieldId);
      if (!field) return;
      if (field.type === 'file') return; // skip file fields, handled separately

      let val = value;
      try {
        if (typeof value === 'string' && value.startsWith('[')) {
          val = JSON.parse(value);
          if (Array.isArray(val)) val = val.join(', ');
        }
      } catch {
        // ignore parse errors
      }

      answersArray.push({ fieldId, value: String(val) });
    });

    // 🟩 2️⃣ Handle file uploads
    if (files && files.length > 0) {
      for (const file of files) {
        answersArray.push({
          fieldId: file.fieldname,
          value: `/uploads/${file.filename}`,
        });
      }
    }

    console.log('🧾 Answers array before save:', answersArray);

    if (answersArray.length === 0) {
      throw new BadRequestException('No valid field IDs found in form data.');
    }

    // 🟩 3️⃣ Create and save FormResponse
    const newResponse = this.responsesRepo.create({
      form,
      items: answersArray.map((ans) =>
        this.itemsRepo.create({
          field: form.fields.find((f) => f.id === ans.fieldId),
          value: ans.value,
        }),
      ),
    });

    await this.responsesRepo.save(newResponse);

    // Emit real-time update to response page
    const totalResponses = await this.responsesRepo.count({ where: { form: { id: form.id } } });
    this.responseGateway.broadcastNewResponse({
      formId: form.id,
      formTitle: form.title,
      responseId: newResponse.id,
      totalAnswers: totalResponses,
      submittedAt: newResponse.createdAt,
      answers: newResponse.items.map(item => ({
        label: item.field.label,
        value: item.value,
      })),
    });

    return { message: 'Response saved successfully', id: newResponse.id };
  }


  // --- 📊 Get All Responses ---
  async getFormResponses(formId: string, user: User): Promise<FormResponse[]> {
    const form = await this.formsRepo.findOne({ where: { id: formId }, relations: ['owner'] });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin')
      throw new NotFoundException('Form not found');

    return this.responsesRepo.find({
      where: { form: { id: formId } },
      relations: ['items', 'items.field'],
    });
  }

  // --- 📁 Get User Forms ---
  async getUserForms(user: User): Promise<Form[]> {
    return this.formsRepo.find({
      where: { owner: { id: user.id } },
      relations: ['fields'],
    });
  }

  // --- 🗑 Delete Response ---
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

  // --- 🧾 Generate QR Code ---
  async generateFormQrCode(formId: string, user: User): Promise<string> {
    const form = await this.formsRepo.findOne({ where: { id: formId }, relations: ['owner'] });
    if (!form) throw new NotFoundException('Form not found');
    if (form.owner?.id !== user.id && user.role.name !== 'admin')
      throw new NotFoundException('Form not found');

    const formUrl = `http://localhost:5173/public/${form.slug}`;
    return this.qrCodeService.generateQrCode(formUrl);
  }

  // --- 💾 Save Draft ---
  async saveFormDraft(formSlug: string, draftData: any, sessionId?: string): Promise<FormDraft> {
    const form = await this.findOne(formSlug);

    let draft = await this.draftsRepo.findOne({
      where: { formId: form.id, sessionId },
    });

    if (draft) {
      draft.draftData = JSON.stringify(draftData);
      draft.updatedAt = new Date();
    } else {
      draft = this.draftsRepo.create({
        formId: form.id,
        form,
        draftData: JSON.stringify(draftData),
        sessionId,
      });
    }

    return this.draftsRepo.save(draft);
  }

  // --- 📥 Load Draft ---
  async loadFormDraft(formSlug: string, sessionId?: string): Promise<any> {
    const form = await this.findOne(formSlug);
    const draft = await this.draftsRepo.findOne({
      where: { formId: form.id, sessionId },
      order: { updatedAt: 'DESC' },
    });
    if (!draft) return null;

    try {
      return JSON.parse(draft.draftData);
    } catch {
      return null;
    }
  }

  // --- 🧹 Delete Draft ---
  async deleteFormDraft(formSlug: string, sessionId?: string): Promise<void> {
    const form = await this.findOne(formSlug);
    await this.draftsRepo.delete({ formId: form.id, sessionId });
  }
}
