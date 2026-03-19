import type { WorkspaceProjectEntryMode } from "@/lib/workspace/project-mode";

export interface CreateWorkspaceModalCopy {
	modalIntroKey: string;
	stepOneLabelKey: string;
	projectDetailsHintKey: string;
	nextToTemplateKey: string;
	startCreatingKey: string;
}

export function getCreateWorkspaceModalCopy(
	entryMode: WorkspaceProjectEntryMode,
): CreateWorkspaceModalCopy {
	if (entryMode === "manga") {
		return {
			modalIntroKey: "wizard.modalIntroManga",
			stepOneLabelKey: "wizard.stepProjectDetailsManga",
			projectDetailsHintKey: "wizard.projectDetailsHintManga",
			nextToTemplateKey: "wizard.nextToTemplateManga",
			startCreatingKey: "wizard.startCreatingManga",
		};
	}

	return {
		modalIntroKey: "wizard.modalIntroStory",
		stepOneLabelKey: "wizard.stepProjectDetailsStory",
		projectDetailsHintKey: "wizard.projectDetailsHintStory",
		nextToTemplateKey: "wizard.nextToTemplateStory",
		startCreatingKey: "wizard.startCreatingStory",
	};
}
