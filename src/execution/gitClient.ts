// src/execution/gitClient.ts
// Operaciones git locales usando simple-git.
// NUNCA toca main o dev directamente.
// V2 extension: agregar soporte para worktrees aquí.

import { simpleGit, type SimpleGit } from "simple-git";
import { logger }                     from "../observability/logger.js";

const PROTECTED_BRANCHES = new Set(["main", "master", "dev", "develop", "staging"]);

export class GitClient {
  private git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.git      = simpleGit(repoPath);
  }

  // Verifica que el repo esté limpio antes de operar
  async assertCleanRepo(): Promise<void> {
    const status = await this.git.status();
    if (!status.isClean()) {
      throw new Error(
        "Repository has uncommitted changes. Commit or stash before running execution."
      );
    }
  }

  // Obtiene el branch actual
  async getCurrentBranch(): Promise<string> {
    const branch = await this.git.revparse(["--abbrev-ref", "HEAD"]);
    return branch.trim();
  }

  // Crea un branch agent/* y hace checkout
  async createAgentBranch(suffix: string): Promise<string> {
    const timestamp  = Date.now().toString(36);
    const branchName = `agent/${suffix}-${timestamp}`;

    const current = await this.getCurrentBranch();
    if (PROTECTED_BRANCHES.has(current)) {
      logger.info(`Base branch: ${current}`);
    }

    await this.git.checkoutLocalBranch(branchName);
    logger.info(`Created branch: ${branchName}`);

    return branchName;
  }

  // Agrega y commitea archivos
  async commitFiles(files: string[], message: string): Promise<string> {
    await this.git.add(files);
    const result = await this.git.commit(message);
    logger.info(`Committed: ${result.commit}`);
    return result.commit;
  }

  // Push del branch al remote
  async pushBranch(branchName: string): Promise<void> {
    await this.git.push("origin", branchName, ["--set-upstream"]);
    logger.info(`Pushed: ${branchName}`);
  }

  // Vuelve al branch original si algo falla
  async checkoutBranch(branch: string): Promise<void> {
    await this.git.checkout(branch);
  }

  getRepoPath(): string {
    return this.repoPath;
  }
}