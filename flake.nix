{
    description = "Podium - Gestionnaire de tournois de baby-foot";

    inputs = {
      nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
      flake-utils.url = "github:numtide/flake-utils";
    };

    outputs = { self, nixpkgs, flake-utils }:
      flake-utils.lib.eachDefaultSystem (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          devShells.default = pkgs.mkShell {
            buildInputs = with pkgs; [
              bun
              nodejs_20
              mysql80
              docker
              docker-compose
              gnumake
              git
              curl
              jq
            ];

            shellHook = ''
              echo "Podium Dev Environment"
              echo "Bun:    $(bun --version)"
              echo "Node:   $(node --version)"
              echo ""
              echo "make setup   - Configure .env"
              echo "make install - Install deps"
              echo "make dev     - Start dev server"
            '';
          };
        }
      );
  }