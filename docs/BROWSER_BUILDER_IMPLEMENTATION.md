## Implementation notes

The first browser builder surface is intentionally dependency-light. The editor and preview shell are now available at `/builder`. WebContainer execution is the next runtime layer and must remain browser-local; the phone is not expected to run Termux or act as a server.
