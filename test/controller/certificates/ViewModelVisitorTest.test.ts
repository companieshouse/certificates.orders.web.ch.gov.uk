import { VisitableViewModel } from "../../../src/controllers/certificates/VisitableViewModel";
import { ViewModelVisitor } from "../../../src/controllers/certificates/ViewModelVisitor";
import { expect } from "chai";

describe("ViewModelVisitorTest", () => {
    describe("visit", () => {
        it("Attaches regular template to view model if user disenrolled", () => {
            // given
            const viewModel: {templateName?: string} = {};
            const visitableViewModel = new VisitableViewModel(viewModel, { enrolled: false });
            const visitor = new ViewModelVisitor("template", "alternate");

            // when
            visitor.visit(visitableViewModel);

            // then
            expect(viewModel.templateName).to.equal("template");
        });

        it("Attaches alternate template to view model if user enrolled", () => {
            // given
            const viewModel: {templateName?: string} = {};
            const visitableViewModel = new VisitableViewModel(viewModel, { enrolled: true });
            const visitor = new ViewModelVisitor("template", "alternate");

            // when
            visitor.visit(visitableViewModel);

            // then
            expect(viewModel.templateName).to.equal("alternate");
        });
    });
});
