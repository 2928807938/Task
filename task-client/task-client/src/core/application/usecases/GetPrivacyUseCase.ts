import {Privacy} from "@/core/domain/entities/Privacy";
import {PrivacyRepository} from "../ports/PrivacyRepository";

// 获取隐私政策用例
export class GetPrivacyUseCase {
  constructor(private readonly privacyRepository: PrivacyRepository) {}

  async execute(): Promise<Privacy> {
    return this.privacyRepository.getPrivacy();
  }
}
