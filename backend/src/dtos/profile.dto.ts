import { IsString, IsOptional, IsEmail, IsUrl, IsPhoneNumber, IsArray } from 'class-validator';

export class BusinessAddress {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postcode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  coordinates?: string; // JSON string for latitude/longitude
}

export class BrandProfile {
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsEmail()
  @IsOptional()
  primaryContactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsPhoneNumber(null)
  @IsOptional()
  primaryContactPhone?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsUrl()
  @IsOptional()
  primaryWebsite?: string;

  @IsString()
  @IsOptional()
  openingHours?: string; // Could be JSON for structured hours

  @IsArray()
  @IsOptional()
  socialLinks?: string[]; // Array of social media URLs

  @IsString()
  @IsOptional()
  brandColor?: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  missionStatement?: string;

  @IsArray()
  @IsOptional()
  certifications?: string[]; // List of certifications/awards

  @IsArray()
  @IsOptional()
  amenities?: string[]; // List of amenities offered
}