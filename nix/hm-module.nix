# Home-manager module for TypeVocal speech-to-text
#
# Provides a systemd user service for autostart.
# Usage: imports = [ typevocal.homeManagerModules.default ];
#        services.typevocal.enable = true;
{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.services.typevocal;
in
{
  options.services.typevocal = {
    enable = lib.mkEnableOption "TypeVocal speech-to-text user service";

    package = lib.mkOption {
      type = lib.types.package;
      defaultText = lib.literalExpression "typevocal.packages.\${system}.typevocal";
      description = "The TypeVocal package to use.";
    };
  };

  config = lib.mkIf cfg.enable {
    systemd.user.services.typevocal = {
      Unit = {
        Description = "TypeVocal speech-to-text";
        After = [ "graphical-session.target" ];
        PartOf = [ "graphical-session.target" ];
      };
      Service = {
        ExecStart = "${cfg.package}/bin/typevocal";
        Restart = "on-failure";
        RestartSec = 5;
      };
      Install.WantedBy = [ "graphical-session.target" ];
    };
  };
}
