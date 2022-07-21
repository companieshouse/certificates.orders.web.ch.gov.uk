import { VisitableViewModel } from "./VisitableViewModel";

export class ViewModelVisitor {
    constructor (private template: string, private alternateTemplate: string) {
    }

    visit (viewModel: VisitableViewModel): void {
        if (viewModel.basket.enrolled) {
            viewModel.viewModel.templateName = this.alternateTemplate;
        } else {
            viewModel.viewModel.templateName = this.template;
        }
    }
}
