import {Terms} from "@/core/domain/entities/Terms";

// 服务条款仓库接口
export interface TermsRepository {
  getTerms(): Promise<Terms>;
}
