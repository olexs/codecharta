import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { HoveredNodePathPanelComponent } from "./hoveredNodePathPanel.component"

@NgModule({
	imports: [CommonModule],
	declarations: [HoveredNodePathPanelComponent],
	exports: [HoveredNodePathPanelComponent],
	entryComponents: [HoveredNodePathPanelComponent]
})
export class HoveredNodePathPanelModule {}
