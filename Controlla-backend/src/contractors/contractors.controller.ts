import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContractorsService } from './contractors.service';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ContractorStatus } from './entities/contractor.entity';
import { multerConfig } from '../config/multer.config';

@ApiTags('contractors')
@Controller('contractors')
export class ContractorsController {
  constructor(private readonly contractorsService: ContractorsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Создать нового подрядчика',
    description: 'Создает нового подрядчика с возможностью загрузки аватара. Поддерживаемые форматы: jpg, jpeg, png, gif. Максимальный размер файла: 5MB.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        role: { 
          type: 'string', 
          enum: ['developer', 'designer', 'manager', 'qa', 'other'],
          example: 'developer'
        },
        hourlyRate: { type: 'number', example: 50 },
        location: { type: 'string', example: 'New York, USA' },
        status: { 
          type: 'string', 
          enum: ['active', 'inactive', 'offline'],
          example: 'active'
        },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Аватар подрядчика (jpg, jpeg, png, gif, max 5MB)'
        }
      },
      required: ['name', 'email', 'role', 'hourlyRate']
    }
  })
  @ApiResponse({ status: 201, description: 'Подрядчик успешно создан' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  async create(
    @Body() createContractorDto: CreateContractorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createContractorDto.avatar = `/uploads/avatars/${file.filename}`;
    }
    return this.contractorsService.create(createContractorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contractors' })
  @ApiResponse({ status: 200, description: 'Return all contractors' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll() {
    try {
      return await this.contractorsService.findAll();
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Error retrieving contractors');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить подрядчика по ID' })
  @ApiParam({ name: 'id', description: 'ID подрядчика' })
  @ApiResponse({ status: 200, description: 'Подрядчик найден' })
  @ApiResponse({ status: 404, description: 'Подрядчик не найден' })
  findOne(@Param('id') id: string) {
    return this.contractorsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Обновить подрядчика',
    description: 'Обновляет данные подрядчика с возможностью загрузки нового аватара. Поддерживаемые форматы: jpg, jpeg, png, gif. Максимальный размер файла: 5MB.'
  })
  @ApiParam({ name: 'id', description: 'ID подрядчика' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        role: { 
          type: 'string', 
          enum: ['developer', 'designer', 'manager', 'qa', 'other'],
          example: 'developer'
        },
        hourlyRate: { type: 'number', example: 50 },
        location: { type: 'string', example: 'New York, USA' },
        status: { 
          type: 'string', 
          enum: ['active', 'inactive', 'offline'],
          example: 'active'
        },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Аватар подрядчика (jpg, jpeg, png, gif, max 5MB)'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Подрядчик успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Подрядчик не найден' })
  async update(
    @Param('id') id: string,
    @Body() updateContractorDto: UpdateContractorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateContractorDto.avatar = `/uploads/avatars/${file.filename}`;
    }
    return this.contractorsService.update(id, updateContractorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить подрядчика' })
  @ApiParam({ name: 'id', description: 'ID подрядчика' })
  @ApiResponse({ status: 200, description: 'Подрядчик успешно удален' })
  @ApiResponse({ status: 404, description: 'Подрядчик не найден' })
  remove(@Param('id') id: string) {
    return this.contractorsService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Обновить статус подрядчика' })
  @ApiParam({ name: 'id', description: 'ID подрядчика' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'offline'],
          example: 'active'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Статус успешно обновлен' })
  @ApiResponse({ status: 400, description: 'Неверный статус' })
  @ApiResponse({ status: 404, description: 'Подрядчик не найден' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ContractorStatus,
  ) {
    if (!Object.values(ContractorStatus).includes(status)) {
      throw new BadRequestException('Invalid status value');
    }
    return this.contractorsService.updateStatus(id, status);
  }

  @Patch(':id/rating')
  @ApiOperation({ summary: 'Обновить рейтинг подрядчика' })
  @ApiParam({ name: 'id', description: 'ID подрядчика' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rating: {
          type: 'number',
          minimum: 0,
          maximum: 5,
          example: 4.5
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Рейтинг успешно обновлен' })
  @ApiResponse({ status: 400, description: 'Неверный рейтинг' })
  @ApiResponse({ status: 404, description: 'Подрядчик не найден' })
  updateRating(
    @Param('id') id: string,
    @Body('rating') rating: number,
  ) {
    if (rating < 0 || rating > 5) {
      throw new BadRequestException('Rating must be between 0 and 5');
    }
    return this.contractorsService.updateRating(id, rating);
  }
}
