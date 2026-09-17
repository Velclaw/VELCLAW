# Open Container Initiative Distribution Specification

## Table of Contents

- [Overview](#overview)
  - [Introduction](#introduction)
  - [Historical Context](#historical-context)
  - [Definitions](#definitions)
  - [Notational Conventions](#notational-conventions)
- [Use Cases](#use-cases)
- [Conformance](#conformance)
- [Requirements](#requirements)
  1. [Pull](#pull)
  2. [Push](#push)
  3. [Content Discovery](#content-discovery)
  4. [Content Management](#content-management)
- [Proxying](#registry-proxying)
- [Backwards Compatibility](#backwards-compatibility)
  - [Unavailable Referrers API](#unavailable-referrers-api)
- [Upgrade Procedures](#upgrade-procedures)
  - [Enabling the Referrers API](#enabling-the-referrers-api)
- [API](#api)
  - [Endpoints](#endpoints)
  - [Error Codes](#error-codes)
  - [Warnings](#warnings)
- [Appendix](#appendix)

## Overview

### Introduction

The **Open Container Initiative Distribution Specification** (a.k.a. "OCI Distribution Spec") defines an API protocol to facilitate and standardize the distribution of content.

The specification is designed to be agnostic of content types.
OCI Image types are currently the most prominent, which are defined in the [Open Container Initiative Image Format Specification](https://github.com/opencontainers/image-spec) (a.k.a. "OCI Image Spec").

### Historical Context

The spec is based on the specification for the Docker Registry HTTP API V2 protocol <sup>[apdx-1](#appendix)</sup>.

For relevant details and a history leading up to this specification, please see the following issues:

- [moby/moby#8093](https://github.com/moby/moby/issues/8093)
- [moby/moby#9015](https://github.com/moby/moby/issues/9015)
- [docker/docker-registry#612](https://github.com/docker/docker-registry/issues/612)

#### Legacy Docker support HTTP headers

Because of the origins of this specification, the client MAY encounter Docker-specific headers, such as `Docker-Distribution-API-Version`.
Unless documented elsewhere in the spec, these headers are OPTIONAL and clients SHOULD NOT depend on them.

#### Legacy Docker support error codes

The client MAY encounter error codes targeting Docker schema1 manifests, such as `TAG_INVALID`, or `MANIFEST_UNVERIFIED`.
These error codes are OPTIONAL and clients SHOULD NOT depend on them.

### Definitions

Several terms are used frequently in this document and warrant basic definitions:

- **Registry**: a service that handles the required APIs defined in this specification
- **Repository**: a scope for API calls on a registry for a collection of content (including manifests, blobs, and tags).
- **Client**: a tool that communicates with Registries
- **Push**: the act of uploading blobs and manifests to a registry
- **Pull**: the act of downloading blobs and manifests from a registry
- **Blob**: the binary form of content that is stored by a registry, addressable by a digest
- **Manifest**: a JSON document uploaded via the manifests endpoint. A manifest may reference other manifests and blobs in a repository via descriptors. Examples of manifests are defined under the OCI Image Spec <sup>[apdx-2](#appendix)</sup>, such as the image manifest and image index (and legacy manifests).</sup>
- **Image Index**: a manifest containing a list of manifests, defined under the OCI Image Spec <sup>[apdx-6](#appendix)</sup>.
- **Image Manifest**: a manifest containing a config descriptor and an indexed list of layers, commonly used for container images, defined under the OCI Image Spec <sup>[apdx-2](#appendix)</sup>.
- **Config**: a blob referenced in the image manifest which contains metadata. Config is defined under the OCI Image Spec <sup>[apdx-4](#appendix)</sup>.
- **Object**: one conceptual piece of content stored as blobs with an accompanying manifest. (This was previously described as an "artifact")
- **Descriptor**: a reference that describes the type, metadata and content address of referenced content. Descriptors are defined under the OCI Image Spec <sup>[apdx-5](#appendix)</sup>.
- **Digest**: a unique identifier created from a cryptographic hash of a Blob's content. Digests are defined under the OCI Image Spec <sup>[apdx-3](#appendix)</sup>
- **Tag**: a custom, human-readable pointer to a manifest. A manifest digest may have zero, one, or many tags referencing it.
- **Subject**: an association from one manifest to another, typically used to attach an artifact to an image.
- **Referrers List**: a list of manifests with a subject relationship to a specified digest. The referrers list is generated with a [query to a registry](#listing-referrers).

### Notational Conventions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) (Bradner, S., "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, March 1997).

## Use Cases

### Content Verification

A container engine would like to run verified image named "library/ubuntu", with the tag "latest".
The engine contacts the registry, requesting the manifest for "library/ubuntu:latest".
An untrusted registry returns a manifest.
After each layer is downloaded, the engine verifies the digest of the layer, ensuring that the content matches that specified by the manifest.

### Resumable Push

Company X's build servers lose connectivity to a distribution endpoint before completing a blob transfer.
After connectivity returns, the build server attempts to re-upload the blob.
The registry notifies the build server that the upload has already been partially attempted.
The build server responds by only sending the remaining data to complete the blob transfer.

### Resumable Pull

Company X is having more connectivity problems but this time in their deployment datacenter.
When downloading a blob, the connection is interrupted before completion.
The client keeps the partial data and uses http `Range` requests to avoid downloading repeated data.

### Layer Upload De-duplication

Company Y's build system creates two identical layers from build processes A and B.
Build process A completes uploading the layer before B.
When process B attempts to upload the layer, the registry indicates that its not necessary because the layer is already known.

If process A and B upload the same layer at the same time, both operations will proceed and the first to complete will be stored in the registry.
Even in the case where both uploads are accepted, the registry may securely only store one copy of the layer since the computed digests match.

## Conformance

For more information on running conformance tests against a registry, please see the [conformance README](./conformance/README.md).

Registry providers can self-certify by submitting conformance results to [opencontainers/oci-conformance](https://github.com/opencontainers/oci-conformance).

Accepted conformance results can be viewed at [conformance.opencontainers.org](https://conformance.opencontainers.org/).

## Requirements

Registry APIs are grouped into the following categories:

1. **Pull** - Clients are able to pull from the registry
2. **Push** - Clients are able to push to the registry
3. **Content Discovery** - Clients are able to list or otherwise query the content stored in the registry
4. **Content Management** - Clients are able to control the full life-cycle of the content stored in the registry

All registries conforming to this specification MUST support, at a minimum, all APIs in the **Pull** category.

Registries SHOULD also support the **Push**, **Content Discovery**, and **Content Management** categories.
A registry claiming conformance with one of these specification categories MUST implement all APIs in the claimed category.

### Pull

The process of pulling an object centers around retrieving two components: the manifest and one or more blobs.

Typically, the first step in pulling an object is to retrieve the manifest. However, you MAY retrieve content from the registry in any order.

#### Pulling manifests

To pull a manifest, perform a `GET` request to a URL in the following form:
`/v2/<name>/manifests/<tag-or-digest>` <sup>[end-3](#endpoints)</sup>

`<name>` refers to the namespace of the repository.
`<tag-or-digest>` MUST be either (a) the digest of the manifest or (b) a tag.
The `<tag-or-digest>` MUST NOT be in any other format.
Throughout this document, `<name>` MUST match the following regular expression:

`[a-z0-9]+((\.|_|__|-+)[a-z0-9]+)*(\/[a-z0-9]+((\.|_|__|-+)[a-z0-9]+)*)*`

_Implementers note:_
Many clients impose a limit of 255 characters on the length of the concatenation of the registry hostname (and optional port), `/`, and `<name>` value.
If the registry name is `registry.example.org:5000`, those clients would be limited to a `<name>` of 229 characters (255 minus 25 for the registry hostname and port and minus 1 for a `/` separator).
For compatibility with those clients, registries should avoid values of `<name>` that would cause this limit to be exceeded.

Throughout this document, `<tag-or-digest>` as a tag MUST be at most 128 characters in length and MUST match the following regular expression:

`[a-zA-Z0-9_][a-zA-Z0-9._-]{0,127}`

The client SHOULD include an `Accept` header indicating which manifest content types it supports.
In a successful response, the `Content-Type` header will indicate the type of the returned manifest.
The registry SHOULD NOT include parameters on the `Content-Type` header.
The client SHOULD ignore parameters on the `Content-Type` header.
The `Content-Type` header SHOULD match what the client [pushed as the manifest's `Content-Type`](#pushing-manifests).
If the manifest has a `mediaType` field, clients SHOULD reject unless the `mediaType` field's value matches the type specified by the `Content-Type` header.
For more information on the use of `Accept` headers and content negotiation, please see [Content Negotiation](./content-negotiation.md) and [RFC 7231 (section 3.1.1.1)](https://www.rfc-editor.org/rfc/rfc7231#section-3.1.1.1).

A GET request to an existing manifest URL MUST provide the expected manifest, with a response code that MUST be `200 OK`.
A successful response MUST contain the digest of the uploaded blob in the header `Docker-Content-Digest`.

The `Docker-Content-Digest` header, if present on the response, returns the digest of the uploaded blob which MAY differ from the provided digest.
If the digest does differ, it MAY be the case that the hashing algorithms used do not match.
See [Content Digests](https://github.com/opencontainers/image-spec/blob/v1.0.1/descriptor.md#digests) <sup>[apdx-3](#appendix)</sup> for information on how to detect the hashing algorithm in use.
Most clients MAY ignore the value, but if it is used, the client MUST verify the value matches the returned manifest.
If the `<tag-or-digest>` part of a manifest request is a digest, clients SHOULD verify the returned manifest matches this digest.

If the manifest is not found in the repository, the response code MUST be `404 Not Found`.

#### Pulling blobs

To pull a blob, perform a `GET` request to a URL in the following form:
`/v2/<name>/blobs/<digest>` <sup>[end-2](#endpoints)</sup>

`<name>` is the namespace of the repository, and `<digest>` is the blob's digest.

A GET request to an existing blob URL MUST provide the expected blob, with a response code that MUST be `200 OK`.
A successful response MUST contain the digest of the uploaded blob in the header `Docker-Content-Digest`.
If present, the value of this header MUST be a digest matching that of the response body.
Most clients MAY ignore the value, but if it is used, the client MUST verify the value matches the returned response body.
Clients SHOULD verify that the response body matches the requested digest.

If the blob is not found in the repository, the response code MUST be `404 Not Found`.

A registry SHOULD support the `Range` request header in accordance with [RFC 9110 (section 14)](https://www.rfc-editor.org/rfc/rfc9110#section-14).

#### Checking if content exists in the registry

In order to verify that a repository contains a given manifest or blob, make a `HEAD` request to a URL in the following form:

`/v2/<name>/manifests/<tag-or-digest>` <sup>[end-3](#endpoints)</sup> (for manifests), or

`/v2/<name>/blobs/<digest>` <sup>[end-2](#endpoints)</sup> (for blobs).

A HEAD request to an existing blob or manifest URL MUST return `200 OK`.
A successful response MUST contain the digest of the uploaded blob or manifest in the header `Docker-Content-Digest`.
A successful response MUST contain the size in bytes of the uploaded blob or manifest in the header `Content-Length`.

_Implementers note:_
Clients may encounter registries implementing earlier spec versions which did not require the `Docker-Content-Digest` header.
In such cases, the clients can reasonably assume the digest algorithm used is sha256.

If the blob or manifest is not found in the repository, the response code MUST be `404 Not Found`.

### Push

Pushing an object typically works in the opposite order as a pull: the blobs making up the object are uploaded first, and the manifest last.
A useful diagram is provided [here](https://github.com/google/go-containerregistry/tree/d7f8d06c87ed209507dd5f2d723267fe35b38a9f/pkg/v1/remote#anatomy-of-an-image-upload).

A registry MUST initially accept an otherwise valid manifest with a `subject` field that references a manifest that does not exist in the repository, allowing clients to push a manifest and referrers to that manifest in either order.
A registry MAY reject a manifest uploaded to the manifest endpoint with descriptors in other fields that reference a manifest or blob that does not exist in the registry.
When a manifest is rejected for this reason, it MUST result in one or more `MANIFEST_BLOB_UNKNOWN` errors <sup>[code-1](#error-codes)</sup>.

#### Pushing blobs

There are two ways to push blobs: chunked or monolithic.

In each implementation, if the client provided digest is invalid or uses an unsupported algorithm, the registry SHOULD respond with a response code `400 Bad Request`.

#### Pushing a blob monolithically

There are two ways to push a blob monolithically:
1. A `POST` request followed by a `PUT` request
2. A single `POST` request

---

##### POST then PUT

To push a blob monolithically by using a POST request followed by a PUT request, there are two steps:
1. Obtain a session id (upload URL)
2. Upload the blob to said URL

To obtain a session ID, perform a `POST` request to a URL in the following format:

`/v2/<name>/blobs/uploads/` <sup>[end-4a](#endpoints)</sup>

Here, `<name>` refers to the namespace of the repository.
Upon success, the response MUST have a code of `202 Accepted`, and MUST include the following header:

```
Location: <blob-push-location>
```

Registries MUST support concurrent uploads from one or more clients, which is commonly implemented with a unique `<blob-push-location>` for each blob upload.

The `<blob-push-location>` MAY be provided by a server other than the registry itself.
In fact, offloading to another server can be a [better strategy](https://www.backblaze.com/blog/design-thinking-b2-apis-the-hidden-costs-of-s3-compatibility/).

The `<blob-push-location>` MAY be absolute (containing the protocol and/or hostname), or it MAY be relative (containing just the URL path).
For more information, see [RFC 7231 (section 7.1.2)](https://www.rfc-editor.org/rfc/rfc7231#section-7.1.2).

_Implementers note:_
Registries commonly set `<blob-push-location>` to `/v2/<name>/blobs/uploads/<unique-id>`, where `<unique-id>` is a unique identifier.

Once the `<blob-push-location>` has been obtained, perform the upload proper by making a `PUT` request to the following URL path, and with the following headers and body:

`<blob-push-location>?digest=<digest>` <sup>[end-6](#endpoints)</sup>
```
Content-Length: <length>
Content-Type: application/octet-stream
```
```
<upload byte stream>
```

The `<blob-push-location>` MAY contain critical query parameters.
Additionally, it MUST match exactly the `<blob-push-location>` obtained from the `POST` request.
It MUST NOT be assembled manually by clients except where absolute/relative conversion is necessary.

Here, `<digest>` is the digest of the blob being uploaded, and `<length>` is its size in bytes.

Upon successful completion of the request, the response MUST have code `201 Created` and MUST have the following header:

```
Location: <blob-location>
```

With `<blob-location>` being a pullable blob URL.

---

##### Single POST

Registries MAY support pushing blobs using a single POST request.

To push a blob monolithically by using a single POST request, perform a `POST` request to a URL in the following form, and with the following headers and body:

`/v2/<name>/blobs/uploads/?digest=<digest>` <sup>[end-4b](#endpoints)</sup>
```
Content-Length: <length>
Content-Type: application/octet-stream
```
```
<upload byte stream>
```

Here, `<name>` is the repository's namespace, `<digest>` is the blob's digest, and `<length>` is the size (in bytes) of the blob.

The `Content-Length` header MUST match the blob's actual content length.
Likewise, the `<digest>` MUST match the blob's digest.

Registries that do not support single request monolithic uploads SHOULD return a `202 Accepted` status code and `Location` header and clients SHOULD proceed with a subsequent PUT request, as described by the [POST then PUT upload method](#post-then-put).

Successful completion of the request MUST return a `201 Created` and MUST include the following header:

```
Location: <blob-location>
```

Here, `<blob-location>` is a pullable blob URL.
This location does not necessarily have to be served by your registry, for example, in the case of a signed URL from some cloud storage provider that your registry generates.

#### Pushing a blob in chunks

A chunked blob upload is accomplished in three phases:
1. Obtain a session ID (upload URL) (`POST`)
2. Upload the chunks (`PATCH`)
3. Close the session (`PUT`)

For information on obtaining a session ID, reference the above section on pushing a blob monolithically via the `POST`/`PUT` method.
The process remains unchanged for chunked upload, except that the post request MUST include the following header:

```
Content-Length: 0
```

When pushing a blob with a digest algorithm other than `sha256`, the post request SHOULD include the `digest-algorithm` parameter:

`/v2/<name>/blobs/uploads/?digest-algorithm=<algorithm>` <sup>[end-4c](#endpoints)</sup>

Here, `<digest-algorithm>` is the algorithm the registry should use for the blob, e.g. `digest-algorithm=sha512`.

If the registry has a minimum chunk size, the `POST` response SHOULD include the following header, where `<size>` is the size in bytes (see the blob `PATCH` definition for usage):

```
OCI-Chunk-Min-Length: <size>
```

Please reference the above section for restrictions on the `<blob-push-location>`.

---
To upload a chunk, issue a `PATCH` request to a URL path in the following format, and with the following headers and body:

URL path: `<blob-push-location>` <sup>[end-5](#endpoints)</sup>
```
Content-Type: application/octet-stream
Content-Range: <range>
Content-Length: <length>
```
```
<upload byte stream of chunk>
```

The `<blob-push-location>` refers to the URL obtained from the preceding `POST` request.

The `<range>` refers to the byte range of the chunk, and MUST be inclusive on both ends.
The first chunk's range MUST begin with `0`.
It MUST match the following regular expression:

```regexp
^[0-9]+-[0-9]+$
```

The `<length>` is the content-length, in bytes, of the current chunk.
If the registry provides an `OCI-Chunk-Min-Length` header in the `POST` response, the size of each chunk, except for the final chunk, SHOULD be greater or equal to that value.
The final chunk MAY have any length.

The response