import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/user.entity';

@Controller('forms')
export class FormsController {
  constructor(private formsService: FormsService) { }

  // Create new form
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() dto: CreateFormDto) {
    const user = req.user; // full user object
    return this.formsService.createForm(user, dto);
  }

  // Get all forms
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    const user = req.user;          // get logged-in user
    return this.formsService.findAll(user); // pass user to service
  }


  // old @Get()
  // findAll() {
  //   return this.formsService.findAll();
  // }

  // Get form by slug
  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.formsService.findOne(slug);
  }

  // Get form by ID
  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  findOneById(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.formsService.findById(id, user);
  }

  // Update form
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateFormDto, @Request() req) {
    const user = req.user;
    return this.formsService.updateForm(id, dto, user);
  }

  // Delete form
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.formsService.deleteForm(id, user);
  }

  // Submit public response
  @Post('public/:slug/submit')
  submit(
    @Param('slug') slug: string,
    @Body() body: { answers: { fieldId: string; value: string }[] },
  ) {
    console.log('Incoming body:', body); // 🔍 Debug log
    return this.formsService.submitResponse(slug, body.answers);
  }

  // gpt new-1@Post('public/:slug/submit')
  // submit(
  //   @Param('slug') slug: string,
  //   @Body() body: { answers: { fieldId: string; value: string }[] },
  // ) {
  //   return this.formsService.submitResponse(slug, body.answers);
  // }
  // old @Post('public/:slug/submit')
  // submit(@Param('slug') slug: string, @Body() answers: { fieldId: string; value: string }[]) {
  //   return this.formsService.submitResponse(slug, answers);
  // }

  // Get form responses
  @Get(':id/responses')
  @UseGuards(JwtAuthGuard)
  getResponses(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.formsService.getFormResponses(id, user);
  }

  // Get user's forms
  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  getUserForms(@Request() req) {
    const user = req.user;
    return this.formsService.getUserForms(user);
  }

  // Generate QR code for form
  @Get(':id/qrcode')
  @UseGuards(JwtAuthGuard)
  generateQrCode(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.formsService.generateFormQrCode(id, user);
  }
}
