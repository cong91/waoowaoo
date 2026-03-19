import { describe, expect, it } from "vitest";

import { getCreateWorkspaceModalCopy } from "@/lib/workspace/create-workspace-modal-copy";

describe("create workspace modal copy", () => {
	it("locks story entry to story-specific copy and hides studio chooser", () => {
		const copy = getCreateWorkspaceModalCopy("story");

		expect(copy.modalIntroKey).toBe("wizard.modalIntroStory");
		expect(copy.stepOneLabelKey).toBe("wizard.stepProjectDetailsStory");
		expect(copy.nextToTemplateKey).toBe("wizard.nextToTemplateStory");
		expect(copy.startCreatingKey).toBe("wizard.startCreatingStory");
		expect("showStudioChoice" in copy).toBe(false);
	});

	it("locks manga entry to manga-specific copy and hides studio chooser", () => {
		const copy = getCreateWorkspaceModalCopy("manga");

		expect(copy.modalIntroKey).toBe("wizard.modalIntroManga");
		expect(copy.stepOneLabelKey).toBe("wizard.stepProjectDetailsManga");
		expect(copy.nextToTemplateKey).toBe("wizard.nextToTemplateManga");
		expect(copy.startCreatingKey).toBe("wizard.startCreatingManga");
		expect("showStudioChoice" in copy).toBe(false);
	});
});
