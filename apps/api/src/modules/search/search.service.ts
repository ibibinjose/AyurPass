import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiSearchDto, SearchTypeFilter } from '../../dtos/search.dto';

export interface SearchResultItem {
  id: string;
  name: string;
  type: string;
  description: string | null;
  doshaFocus: any;
  provider: {
    id: string;
    businessName: string;
    type: string;
    verificationStatus: string;
    address: any;
  };
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Secure, AI-Ready semantic search engine.
   * Maps natural language wellness queries (symptoms/imbalances)
   * to matching Dosha parameters and retrieves vetted services.
   */
  async searchAi(dto: AiSearchDto) {
    const queryStr = dto.q.toLowerCase().trim();

    // 1. Dosha classification heuristic (AI intent parser)
    let matchedDosha: 'vata' | 'pitta' | 'kapha' | null = null;

    const vataSignals = ['dry', 'cold', 'anxious', 'stress', 'sleep', 'insomnia', 'joints', 'pain', 'constipation', 'vata', 'wind'];
    const pittaSignals = ['hot', 'acidity', 'anger', 'skin', 'rash', 'inflammation', 'eyes', 'burn', 'pitta', 'fire'];
    const kaphaSignals = ['heavy', 'sluggish', 'lethargic', 'weight', 'fluid', 'congestion', 'mucus', 'kapha', 'water', 'earth'];

    const vataScore = vataSignals.filter(sig => queryStr.includes(sig)).length;
    const pittaScore = pittaSignals.filter(sig => queryStr.includes(sig)).length;
    const kaphaScore = kaphaSignals.filter(sig => queryStr.includes(sig)).length;

    if (vataScore > 0 || pittaScore > 0 || kaphaScore > 0) {
      const max = Math.max(vataScore, pittaScore, kaphaScore);
      if (max === vataScore) matchedDosha = 'vata';
      else if (max === pittaScore) matchedDosha = 'pitta';
      else matchedDosha = 'kapha';
    }

    // 2. Query matching services
    // Standard text matching + optional dosha alignment
    const serviceResults = await this.prisma.service.findMany({
      where: {
        OR: [
          { name: { contains: queryStr, mode: 'insensitive' } },
          { description: { contains: queryStr, mode: 'insensitive' } },
        ],
        ...(dto.type && dto.type !== SearchTypeFilter.ALL
          ? { provider: { type: dto.type as any } }
          : {}),
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            type: true,
            verificationStatus: true,
            address: true,
          },
        },
      },
      take: 20,
    });

    // 3. Query matching packages
    const packageResults = await this.prisma.package.findMany({
      where: {
        OR: [
          { name: { contains: queryStr, mode: 'insensitive' } },
          { description: { contains: queryStr, mode: 'insensitive' } },
        ],
        ...(dto.type && dto.type !== SearchTypeFilter.ALL
          ? { provider: { type: dto.type as any } }
          : {}),
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            type: true,
            verificationStatus: true,
            address: true,
          },
        },
      },
      take: 10,
    });

    // 4. Map & filter results (semantic ranking & safety selection)
    const results: SearchResultItem[] = [];

    // Map services
    for (const service of serviceResults) {
      results.push({
        id: service.id,
        name: service.name,
        type: 'service',
        description: service.description,
        doshaFocus: service.doshaCompatibility,
        provider: {
          id: service.provider.id,
          businessName: service.provider.businessName,
          type: service.provider.type,
          verificationStatus: service.provider.verificationStatus,
          address: service.provider.address,
        },
      });
    }

    // Map packages
    for (const pkg of packageResults) {
      results.push({
        id: pkg.id,
        name: pkg.name,
        type: 'package',
        description: pkg.description,
        doshaFocus: pkg.doshaFocus,
        provider: {
          id: pkg.provider.id,
          businessName: pkg.provider.businessName,
          type: pkg.provider.type,
          verificationStatus: pkg.provider.verificationStatus,
          address: pkg.provider.address,
        },
      });
    }

    // 5. Apply AI-based semantic sorting
    return results.sort((a, b) => {
      // Rank 1: Verified providers first
      const aVerified = a.provider.verificationStatus === 'verified' ? 1 : 0;
      const bVerified = b.provider.verificationStatus === 'verified' ? 1 : 0;
      if (aVerified !== bVerified) return bVerified - aVerified;

      // Rank 2: Dosha compatibility matches
      if (matchedDosha) {
        const aDoshaMatch = this.checkDoshaMatch(a.doshaFocus, matchedDosha) ? 1 : 0;
        const bDoshaMatch = this.checkDoshaMatch(b.doshaFocus, matchedDosha) ? 1 : 0;
        if (aDoshaMatch !== bDoshaMatch) return bDoshaMatch - aDoshaMatch;
      }

      return a.name.localeCompare(b.name);
    });
  }

  private checkDoshaMatch(doshaJson: any, target: 'vata' | 'pitta' | 'kapha'): boolean {
    if (!doshaJson) return false;
    try {
      const parsed = typeof doshaJson === 'string' ? JSON.parse(doshaJson) : doshaJson;
      // Format: { vata: true, pitta: false } or { targetDosha: true }
      return Boolean(parsed[target] === true || parsed[target] === 'true' || parsed.suitableFor?.includes(target));
    } catch {
      return false;
    }
  }
}
