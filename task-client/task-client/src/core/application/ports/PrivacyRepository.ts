import {Privacy} from "@/core/domain/entities/Privacy";

// 隐私政策仓库接口
export interface PrivacyRepository {
  getPrivacy(): Promise<Privacy>;
}
