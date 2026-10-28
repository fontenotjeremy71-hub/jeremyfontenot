# SharePoint original-export recovery — open investigation

The existing production QA report on PR #120 identifies 802 inventory records but only one historical byte-for-byte original verified. The repository path named `evidence-library/preserved-sharepoint/source/` is **not** sufficient proof of original-byte preservation: its current HTML files can be sanitized or presentation derivatives.

## Recovery procedure
1. Preserve all existing repository and production evidence unchanged.
2. Locate the original `lab-documentation/docs/` export tree or a commit/archive containing the original bytes, including Git history, prior repository clones, GitHub Actions artifacts, backups, and retained ZIP archives.
3. From the repository root, run `node scripts/validation/verify-sharepoint-originals.js /absolute/path/to/lab-documentation`. The script prints a record-level JSON report and exits nonzero if any original is missing or its SHA-256 differs from the inventory. It never modifies evidence.
4. Retain the output as an Actions artifact or local evidence file. Only label a record *original verified* when the recovered file's SHA-256 matches the inventory. Verify the inventory's own historical provenance separately.
5. If recovered originals are added to the repository, store them in a separate immutable directory rather than overwriting current source or wrappers. Require review of any mass file additions.
6. Update PR #120's final report with the actual verified count, unmatched paths, original source commit/archive, and remaining limitations.

## Current verified boundary
The QA report identifies source repository `jeremyfontenot/JeremyFontenot.github.io` at `5581bd7bf9c61ff77000ac04aa39fcbb04ed004f`, and an inventory attestation for 802 entries. The prior audit found one historical exact-hash match and 801 unmatched originals. These numbers are not revised until the recovered bytes pass independent comparison.

**Do not conflate production derivative integrity with original export authentication.**
