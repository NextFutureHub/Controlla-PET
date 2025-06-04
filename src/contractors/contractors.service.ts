import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contractor, ContractorStatus } from './entities/contractor.entity';
import { CreateContractorDto } from './dto/create-contractor.dto';

@Injectable()
export class ContractorsService {
  private readonly logger = new Logger(ContractorsService.name);

  constructor(
    @InjectRepository(Contractor)
    private contractorsRepository: Repository<Contractor>,
  ) {}

  async create(createContractorDto: CreateContractorDto): Promise<Contractor> {
    try {
      const contractor = this.contractorsRepository.create({
        ...createContractorDto,
        rating: 0 // Начальный рейтинг
      });
      return await this.contractorsRepository.save(contractor);
    } catch (error) {
      this.logger.error(`Error creating contractor: ${error.message}`, error.stack);
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new BadRequestException('Email already exists');
      }
      throw new InternalServerErrorException('Error creating contractor');
    }
  }

  async updateStatus(id: string, status: ContractorStatus): Promise<Contractor> {
    try {
      const contractor = await this.findOne(id);
      contractor.status = status;
      return await this.contractorsRepository.save(contractor);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating contractor status ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating contractor status');
    }
  }

  async updateRating(id: string, newRating: number): Promise<Contractor> {
    try {
      const contractor = await this.findOne(id);
      if (typeof newRating !== 'number' || isNaN(newRating) || newRating < 0 || newRating > 5) {
        throw new BadRequestException('Rating must be a number between 0 and 5');
      }
      contractor.rating = Number(newRating.toFixed(2));
      const savedContractor = await this.contractorsRepository.save(contractor);
      this.logger.debug(`Updated rating for contractor ${id}: ${savedContractor.rating}`);
      return savedContractor;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error updating contractor rating ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating contractor rating');
    }
  }

  async findOne(id: string): Promise<Contractor> {
    const contractor = await this.contractorsRepository.findOne({ where: { id } });
    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }
    return contractor;
  }
} 