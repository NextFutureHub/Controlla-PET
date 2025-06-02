import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { User } from '../users/entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, userId: string): Promise<Company> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.company) {
      throw new BadRequestException('User already has a company');
    }

    const company = this.companiesRepository.create(createCompanyDto);
    const savedCompany = await this.companiesRepository.save(company);

    // Update user with company
    user.company = savedCompany;
    await this.usersRepository.save(user);

    return savedCompany;
  }

  async findByUserId(userId: string): Promise<Company> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['company'],
    });

    if (!user || !user.company) {
      throw new NotFoundException('Company not found');
    }

    return user.company;
  }

  async updateByUserId(userId: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['company'],
    });

    if (!user || !user.company) {
      throw new NotFoundException('Company not found');
    }

    const updatedCompany = await this.companiesRepository.save({
      ...user.company,
      ...updateCompanyDto,
    });

    return updatedCompany;
  }
} 