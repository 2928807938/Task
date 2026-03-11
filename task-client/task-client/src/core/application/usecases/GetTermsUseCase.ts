import {Terms} from "@/core/domain/entities/Terms";
import {TermsRepository} from "../ports/TermsRepository";

// 获取服务条款用例
export class GetTermsUseCase {
  constructor(private readonly termsRepository: TermsRepository) {}

  async execute(): Promise<Terms> {
    return this.termsRepository.getTerms();
  }
}
