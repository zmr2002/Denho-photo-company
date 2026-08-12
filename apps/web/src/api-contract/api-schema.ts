export interface paths {
    "/api/v1/public/inquiries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/{collection}/{id}/{action}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["changeState"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["users"];
        put?: never;
        post: operations["createUser"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["findAssets"];
        put?: never;
        post: operations["upload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/media/{id}/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["trash"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/media/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/media/{id}/purge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["purge"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/articles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["articles"];
        put?: never;
        post: operations["createArticle"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/works/{id}/images": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["updateWorkImages"];
        trace?: never;
    };
    "/api/v1/admin/users/{id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["changeStatus"];
        trace?: never;
    };
    "/api/v1/admin/users/{id}/role": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["changeRole"];
        trace?: never;
    };
    "/api/v1/admin/notices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["notices"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["saveNotice"];
        trace?: never;
    };
    "/api/v1/admin/inquiries/{id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["changeStatus_1"];
        trace?: never;
    };
    "/api/v1/admin/articles/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["article"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["updateArticle"];
        trace?: never;
    };
    "/api/v1/public/works": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["works"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/public/works/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["work"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/public/notices/current": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["currentNotice"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/public/media/{variant}/{filename}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["read"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/public/articles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["articles_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/public/articles/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["article_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["session"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/csrf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["csrf"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/{collection}/{id}/revisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["findRevisions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/works": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["works_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/works/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["work_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/media/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["findAsset"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/inquiries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["findAll"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        PublicInquiryRequest: {
            /** Format: uuid */
            idempotencyKey: string;
            nameCompany: string;
            /** Format: email */
            email: string;
            projectType: string;
            requestedDate?: string;
            location?: string;
            message: string;
            locale: string;
            consentVersion: string;
            consented?: boolean;
            turnstileToken?: string;
            companyWebsite?: string;
        };
        PublicInquiryResponse: {
            /** Format: uuid */
            id?: string;
            /** @enum {string} */
            status?: "NEW" | "IN_PROGRESS" | "CLOSED" | "SPAM" | "ANONYMIZED";
            /** Format: date-time */
            receivedAt?: string;
        };
        LoginRequest: {
            /** Format: email */
            email: string;
            password: string;
        };
        SessionResponse: {
            authenticated?: boolean;
            /** Format: uuid */
            userId?: string;
            email?: string;
            displayName?: string;
            role?: string;
        };
        VersionRequest: {
            /** Format: int64 */
            expectedVersion: number;
        };
        ContentStateResponse: {
            /** @enum {string} */
            resourceType?: "ARTICLE" | "WORK" | "NOTICE";
            /** Format: uuid */
            id?: string;
            /** @enum {string} */
            status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
            /** Format: int64 */
            version?: number;
            /** Format: date-time */
            archivedAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        CreateUserRequest: {
            /** Format: email */
            email: string;
            displayName: string;
            password: string;
            /** @enum {string} */
            role: "ADMIN" | "EDITOR";
        };
        UserResponse: {
            /** Format: uuid */
            id?: string;
            email?: string;
            displayName?: string;
            /** @enum {string} */
            role?: "ADMIN" | "EDITOR";
            active?: boolean;
            /** Format: date-time */
            verifiedAt?: string;
            /** Format: date-time */
            lastLoginAt?: string;
            /** Format: date-time */
            createdAt?: string;
        };
        MediaAssetResponse: {
            /** Format: uuid */
            id?: string;
            originalFilename?: string;
            contentType?: string;
            /** Format: int64 */
            byteSize?: number;
            /** Format: int32 */
            width?: number;
            /** Format: int32 */
            height?: number;
            sha256?: string;
            /** @enum {string} */
            status?: "ACTIVE" | "TRASHED" | "DELETED";
            url?: string;
            thumbnailUrl?: string;
            /** Format: int64 */
            referenceCount?: number;
            /** Format: date-time */
            trashedAt?: string;
            /** Format: date-time */
            purgeAfter?: string;
            /** Format: date-time */
            createdAt?: string;
        };
        ArticleBlockInput: {
            type: string;
            heading?: string;
            body?: string;
            imagePath?: string;
            imageAlt?: string;
            imageTone: string;
            caption?: string;
            /** Format: int32 */
            sortOrder?: number;
        };
        ArticleInput: {
            locale: string;
            slug: string;
            title: string;
            excerpt: string;
            category: string;
            authorName: string;
            heroLabel?: string;
            heroImagePath?: string;
            heroAlt?: string;
            heroTone: string;
            heroCaption?: string;
            closingNote?: string;
            ctaLabel?: string;
            ctaHref?: string;
            /** Format: date-time */
            publishedAt?: string;
            /** Format: int32 */
            displayOrder?: number;
            relatedServices: string[];
            seoTitle?: string;
            seoDescription?: string;
            youtubeUrl?: string;
            demo?: boolean;
            blocks: components["schemas"]["ArticleBlockInput"][];
        };
        JsonNode: {
            empty?: boolean;
            array?: boolean;
            null?: boolean;
            object?: boolean;
            float?: boolean;
            container?: boolean;
            boolean?: boolean;
            double?: boolean;
            string?: boolean;
            int?: boolean;
            binary?: boolean;
            pojo?: boolean;
            short?: boolean;
            /** @deprecated */
            textual?: boolean;
            long?: boolean;
            integralNumber?: boolean;
            /** @enum {string} */
            nodeType?: "ARRAY" | "BINARY" | "BOOLEAN" | "MISSING" | "NULL" | "NUMBER" | "OBJECT" | "POJO" | "STRING";
            floatingPointNumber?: boolean;
            bigDecimal?: boolean;
            bigInteger?: boolean;
            valueNode?: boolean;
            missingNode?: boolean;
            number?: boolean;
            embeddedValue?: boolean;
        };
        WorkImageInput: {
            path: string;
            label: string;
            tone: string;
            altJa?: string;
            altZh?: string;
            altEn?: string;
            captionJa?: string;
            captionZh?: string;
            captionEn?: string;
            isCover?: boolean;
            /** Format: int32 */
            sortOrder?: number;
        };
        WorkImagesInput: {
            /** Format: int64 */
            expectedVersion?: number;
            galleryEnabled?: boolean;
            mediaType: string;
            images: components["schemas"]["WorkImageInput"][];
            coverSelectionValid?: boolean;
        };
        ChangeStatusRequest: {
            active?: boolean;
        };
        ChangeRoleRequest: {
            /** @enum {string} */
            role: "ADMIN" | "EDITOR";
        };
        NoticeInput: {
            locale: string;
            enabled?: boolean;
            label: string;
            title: string;
            body: string;
            dismissLabel: string;
            linkLabel?: string;
            linkHref?: string;
            storageKey: string;
            dismissalMode: string;
            /** Format: date-time */
            startAt?: string;
            /** Format: date-time */
            endAt?: string;
            /** Format: int64 */
            expectedVersion?: number;
        };
        StatusRequest: {
            /** @enum {string} */
            status: "NEW" | "IN_PROGRESS" | "CLOSED" | "SPAM" | "ANONYMIZED";
        };
        InquiryResponse: {
            /** Format: uuid */
            id?: string;
            nameCompany?: string;
            email?: string;
            projectType?: string;
            requestedDate?: string;
            location?: string;
            message?: string;
            locale?: string;
            /** @enum {string} */
            status?: "NEW" | "IN_PROGRESS" | "CLOSED" | "SPAM" | "ANONYMIZED";
            consentVersion?: string;
            /** Format: date-time */
            consentedAt?: string;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        ArticleUpdateRequest: {
            /** Format: int64 */
            expectedVersion?: number;
            article: components["schemas"]["ArticleInput"];
        };
        WorkSummary: {
            /** Format: uuid */
            id?: string;
            locale?: string;
            slug?: string;
            title?: string;
            summary?: string;
            category?: string;
            serviceCategory?: string;
            featuredOnHomepage?: boolean;
            /** Format: int32 */
            featuredOrder?: number;
            mediaType?: string;
            coverImagePath?: string;
            coverImageAlt?: string;
            coverImageTone?: string;
        };
        WorkDetail: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            translationGroupId?: string;
            locale?: string;
            slug?: string;
            title?: string;
            summary?: string;
            clientName?: string;
            projectDate?: string;
            category?: string;
            serviceCategory?: string;
            scope?: string;
            challenge?: string;
            approach?: string[];
            outcome?: string;
            deliverables?: string[];
            featuredOnHomepage?: boolean;
            /** Format: int32 */
            featuredOrder?: number;
            mediaType?: string;
            galleryEnabled?: boolean;
            seoTitle?: string;
            seoDescription?: string;
            youtubeUrl?: string;
            /** Format: int64 */
            version?: number;
            /** Format: date-time */
            updatedAt?: string;
            images?: components["schemas"]["WorkImage"][];
        };
        WorkImage: {
            /** Format: uuid */
            id?: string;
            path?: string;
            label?: string;
            tone?: string;
            alt?: string;
            caption?: string;
            cover?: boolean;
            /** Format: int32 */
            sortOrder?: number;
        };
        Notice: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            translationGroupId?: string;
            locale?: string;
            label?: string;
            title?: string;
            body?: string;
            dismissLabel?: string;
            linkLabel?: string;
            linkHref?: string;
            storageKey?: string;
            dismissalMode?: string;
            /** Format: date-time */
            startAt?: string;
            /** Format: date-time */
            endAt?: string;
            /** Format: int64 */
            version?: number;
        };
        ArticleSummary: {
            /** Format: uuid */
            id?: string;
            locale?: string;
            slug?: string;
            title?: string;
            excerpt?: string;
            category?: string;
            authorName?: string;
            heroImagePath?: string;
            heroAlt?: string;
            heroTone?: string;
            /** Format: date-time */
            publishedAt?: string;
            /** Format: int32 */
            displayOrder?: number;
            demo?: boolean;
        };
        ArticleBlock: {
            /** Format: uuid */
            id?: string;
            type?: string;
            heading?: string;
            body?: string;
            imagePath?: string;
            imageAlt?: string;
            imageTone?: string;
            caption?: string;
            /** Format: int32 */
            sortOrder?: number;
        };
        ArticleDetail: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            translationGroupId?: string;
            locale?: string;
            slug?: string;
            title?: string;
            excerpt?: string;
            category?: string;
            authorName?: string;
            heroLabel?: string;
            heroImagePath?: string;
            heroAlt?: string;
            heroTone?: string;
            heroCaption?: string;
            closingNote?: string;
            ctaLabel?: string;
            ctaHref?: string;
            /** Format: date-time */
            publishedAt?: string;
            relatedServices?: string[];
            seoTitle?: string;
            seoDescription?: string;
            youtubeUrl?: string;
            demo?: boolean;
            /** Format: int64 */
            version?: number;
            /** Format: date-time */
            updatedAt?: string;
            blocks?: components["schemas"]["ArticleBlock"][];
        };
        CsrfResponse: {
            headerName?: string;
            parameterName?: string;
            token?: string;
        };
        RevisionResponse: {
            /** Format: uuid */
            id?: string;
            /** Format: int64 */
            version?: number;
            action?: string;
            snapshot?: components["schemas"]["JsonNode"];
            /** Format: uuid */
            actorId?: string;
            /** Format: date-time */
            createdAt?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PublicInquiryRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PublicInquiryResponse"];
                };
            };
        };
    };
    login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SessionResponse"];
                };
            };
        };
    };
    changeState: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                collection: string;
                id: string;
                action: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ContentStateResponse"];
                };
            };
        };
    };
    users: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["UserResponse"][];
                };
            };
        };
    };
    createUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateUserRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["UserResponse"];
                };
            };
        };
    };
    findAssets: {
        parameters: {
            query?: {
                status?: "ACTIVE" | "TRASHED" | "DELETED";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MediaAssetResponse"][];
                };
            };
        };
    };
    upload: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MediaAssetResponse"];
                };
            };
        };
    };
    trash: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MediaAssetResponse"];
                };
            };
        };
    };
    restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MediaAssetResponse"];
                };
            };
        };
    };
    purge: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    articles: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["JsonNode"][];
                };
            };
        };
    };
    createArticle: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ArticleInput"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["JsonNode"];
                };
            };
        };
    };
    updateWorkImages: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkImagesInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["JsonNode"];
                };
            };
        };
    };
    changeStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangeStatusRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["UserResponse"];
                };
            };
        };
    };
    changeRole: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangeRoleRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["UserResponse"];
                };
            };
        };
    };
    notices: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["JsonNode"][];
                };
            };
        };
    };
    saveNotice: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NoticeInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["JsonNode"];
                };
            };
        };
    };
    changeStatus_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StatusRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"];
                };
            };
        };
    };
    article: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["JsonNode"];
                };
            };
        };
    };
    updateArticle: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ArticleUpdateRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["JsonNode"];
                };
            };
        };
    };
    works: {
        parameters: {
            query?: {
                locale?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["WorkSummary"][];
                };
            };
        };
    };
    work: {
        parameters: {
            query?: {
                locale?: string;
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["WorkDetail"];
                };
            };
        };
    };
    currentNotice: {
        parameters: {
            query?: {
                locale?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["Notice"];
                };
            };
        };
    };
    read: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                variant: string;
                filename: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": string;
                };
            };
        };
    };
    articles_1: {
        parameters: {
            query?: {
                locale?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ArticleSummary"][];
                };
            };
        };
    };
    article_1: {
        parameters: {
            query?: {
                locale?: string;
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ArticleDetail"];
                };
            };
        };
    };
    session: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SessionResponse"];
                };
            };
        };
    };
    csrf: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CsrfResponse"];
                };
            };
        };
    };
    findRevisions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                collection: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RevisionResponse"][];
                };
            };
        };
    };
    works_1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["JsonNode"][];
                };
            };
        };
    };
    work_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["JsonNode"];
                };
            };
        };
    };
    findAsset: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MediaAssetResponse"];
                };
            };
        };
    };
    findAll: {
        parameters: {
            query?: {
                status?: "NEW" | "IN_PROGRESS" | "CLOSED" | "SPAM" | "ANONYMIZED";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"][];
                };
            };
        };
    };
}
