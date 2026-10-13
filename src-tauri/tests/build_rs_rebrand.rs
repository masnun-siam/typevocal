//! Guards the TypeVocal rebrand of build.rs (issue #45): Linux rpath and
//! build-time env var names. Reads the source text; no build script is run.

const BUILD_RS: &str = include_str!("../build.rs");

#[test]
fn build_rs_has_no_handy_references() {
    let hits: Vec<_> = BUILD_RS
        .lines()
        .enumerate()
        .filter(|(_, l)| l.to_lowercase().contains("handy"))
        .map(|(i, l)| format!("{}: {}", i + 1, l.trim()))
        .collect();
    assert!(
        hits.is_empty(),
        "leftover 'handy' in build.rs:\n{}",
        hits.join("\n")
    );
}

#[test]
fn build_rs_uses_typevocal_rpath() {
    assert!(BUILD_RS.contains("-Wl,-rpath,$ORIGIN/../lib/TypeVocal:$ORIGIN/../lib"));
}

#[test]
fn build_rs_uses_typevocal_env_vars() {
    for var in ["TYPEVOCAL_VC_REDIST_DIRS", "TYPEVOCAL_FORCE_AI_STUB"] {
        assert!(BUILD_RS.contains(var), "missing {var}");
    }
}
