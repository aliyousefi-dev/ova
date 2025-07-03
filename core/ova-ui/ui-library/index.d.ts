import * as i0 from '@angular/core';
import { Router } from '@angular/router';

declare class UiLibrary {
    static ɵfac: i0.ɵɵFactoryDeclaration<UiLibrary, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UiLibrary, "lib-ui-library", never, {}, {}, never, never, true, never>;
}

declare class TagLinkComponent {
    private router;
    tag: string;
    constructor(router: Router);
    onClick(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TagLinkComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TagLinkComponent, "app-tag-link", never, { "tag": { "alias": "tag"; "required": false; }; }, {}, never, never, true, never>;
}

export { TagLinkComponent, UiLibrary };
