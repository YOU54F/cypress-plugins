cat <<EOF > default.xkb 
xkb_keymap "default" {
  xkb_keycodes             { include "evdev+aliases(qwerty)" };
  xkb_types                { include "complete" };
  xkb_compatibility        { include "complete" };
  xkb_symbols              { include "pc+us+inet(evdev)" };
  xkb_geometry             { include "pc(pc105)" };
};
EOF

xkbcomp -xkm default.xkb 
