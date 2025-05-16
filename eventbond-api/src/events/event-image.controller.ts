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
  Patch,
  ConsoleLogger,
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
  private readonly logger = new ConsoleLogger(EventImageController.name);

  constructor(private readonly eventImageService: EventImageService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('/uploadEventImage/:eventId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = resolve(process.cwd(), 'eventbond-uploads');
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
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
    @Body('isPrimary') isPrimaryString?: string,
  ) {
    this.logger.log(`uploadImage endpoint hit for eventId: ${eventId}, isPrimaryString: ${isPrimaryString}, file: ${file?.originalname}`);
    if (!file) {
      this.logger.warn('No file received in uploadImage endpoint');
    }
    const primaryFlag = isPrimaryString === 'true';
    this.logger.log(`uploadImage - Converted primaryFlag: ${primaryFlag}`);
    return this.eventImageService.uploadImage(eventId, file, primaryFlag);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch('/:imageId/set-primary')
  async setPrimaryImage(
    @Param('imageId') imageId: string,
  ) {
    this.logger.log(`setPrimaryImage endpoint hit for imageId: ${imageId}`);
    return this.eventImageService.setPrimaryImage(parseInt(imageId, 10));
  }

  @Get('/getEventImages/:eventId')
  async getImagesByEvent(@Param('eventId') eventId: number) {
    this.logger.log(`getImagesByEvent endpoint hit for eventId: ${eventId}`);
    return this.eventImageService.getImagesByEvent(eventId);
  }

  @Get('/getImage/:id')
  async getImageFile(@Param('id') id: number, @Res() res: Response) {
    this.logger.log(`getImageFile endpoint hit for id: ${id}`);
    const image = await this.eventImageService.getImage(id);
    const fullPath = resolve(process.cwd(), 'eventbond-uploads', image.imageUrl);
    return res.sendFile(fullPath);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('/deleteImage/:id')
  async deleteImage(@Param('id') id: number) {
    this.logger.log(`deleteImage endpoint hit for id: ${id}`);
    return this.eventImageService.deleteImage(id);
  }
}
