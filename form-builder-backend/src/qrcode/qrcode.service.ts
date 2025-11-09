import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateQrCode(text: string): Promise<string> {
    return QRCode.toDataURL(text);  //qr image created
  }
}
