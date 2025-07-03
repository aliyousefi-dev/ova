import * as i0 from '@angular/core';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as i1 from '@angular/router';
import { RouterModule } from '@angular/router';

class UiLibrary {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: UiLibrary, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.0.0", type: UiLibrary, isStandalone: true, selector: "lib-ui-library", ngImport: i0, template: `
    <p>
      ui-library works!
    </p>
  `, isInline: true, styles: [""] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: UiLibrary, decorators: [{
            type: Component,
            args: [{ selector: 'lib-ui-library', imports: [], template: `
    <p>
      ui-library works!
    </p>
  ` }]
        }] });

class TagLinkComponent {
    router;
    tag;
    constructor(router) {
        this.router = router;
    }
    onClick() {
        this.router.navigate(['/discover'], { queryParams: { q: this.tag } });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: TagLinkComponent, deps: [{ token: i1.Router }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.0.0", type: TagLinkComponent, isStandalone: true, selector: "app-tag-link", inputs: { tag: "tag" }, ngImport: i0, template: "<a\r\n  href=\"#\"\r\n  (click)=\"onClick(); $event.preventDefault()\"\r\n  class=\"inline-flex items-center bg-base-200 hover:bg-base-300 transition rounded-md text-xs px-2 py-0.5 select-none cursor-pointer\"\r\n>\r\n  #{{ tag }}\r\n</a>\r\n", dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "ngmodule", type: RouterModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: TagLinkComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-tag-link', standalone: true, imports: [CommonModule, RouterModule], template: "<a\r\n  href=\"#\"\r\n  (click)=\"onClick(); $event.preventDefault()\"\r\n  class=\"inline-flex items-center bg-base-200 hover:bg-base-300 transition rounded-md text-xs px-2 py-0.5 select-none cursor-pointer\"\r\n>\r\n  #{{ tag }}\r\n</a>\r\n" }]
        }], ctorParameters: () => [{ type: i1.Router }], propDecorators: { tag: [{
                type: Input
            }] } });

/*
 * Public API Surface of ui-library
 */

/**
 * Generated bundle index. Do not edit.
 */

export { TagLinkComponent, UiLibrary };
//# sourceMappingURL=ui-library.mjs.map
