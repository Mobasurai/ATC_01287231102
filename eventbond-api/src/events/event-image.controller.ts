import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  Get,
  Res,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { EventImageService } from './event-image.service';
import { resolve, extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Response } from 'express';
import { File as MulterFile } from 'multer';

function imageFileFilter(req, file, cb) {
  const isImage = /^image\/(jpeg|png|gif|bmp|webp|svg\+xml)$/.test(
    file.mimetype,
  );
  if (!isImage) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
}

@Controller('eventImages')
export class EventImageController {
  constructor(private readonly eventImageService: EventImageService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('/uploadEventImage/:eventId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = resolve(process.cwd(), 'eventbond-uploads');
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadImage(
    @Param('eventId') eventId: number,
    @UploadedFile() file: MulterFile,
    @Body('isPrimary') isPrimary: boolean,
  ) {
    return this.eventImageService.uploadImage(eventId, file, isPrimary);
  }

  @Get('/getEventImages/:eventId')
  async getImagesByEvent(@Param('eventId') eventId: number) {
    return this.eventImageService.getImagesByEvent(eventId);
  }

  @Get('/getImage/:id')
  async getImageFile(@Param('id') id: number, @Res() res: Response) {
    const image = await this.eventImageService.getImage(id);
    return res.sendFile(image.imageUrl);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('/deleteImage/:id')
  async deleteImage(@Param('id') id: number) {
    return this.eventImageService.deleteImage(id);
  }
}
