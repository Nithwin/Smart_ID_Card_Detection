"""
Module Registration for Ultralytics YOLOv8
==========================================
Registers custom modules so they can be referenced in YAML architecture configs.
"""

import importlib
from custom_modules.attention import CBAM, CoordAtt, EMA, C2f_CBAM


def register_custom_modules():
    """Register all custom modules with the ultralytics framework.

    This patches the ultralytics module namespace so that custom modules
    can be referenced by name in YAML architecture configuration files.
    """
    import ultralytics.nn.modules as nn_modules
    import ultralytics.nn.modules.conv as conv_modules
    import ultralytics.nn.modules.block as block_modules
    from ultralytics.nn import tasks

    # Register each custom module
    custom_modules = {
        'CBAM': CBAM,
        'CoordAtt': CoordAtt,
        'EMA': EMA,
        'C2f_CBAM': C2f_CBAM,
    }

    for name, module_cls in custom_modules.items():
        setattr(nn_modules, name, module_cls)
        setattr(tasks, name, module_cls)

        # Also try to add to the conv/block submodules for broader compatibility
        try:
            setattr(conv_modules, name, module_cls)
        except Exception:
            pass
        try:
            setattr(block_modules, name, module_cls)
        except Exception:
            pass

    # Update the __all__ in modules if it exists
    if hasattr(nn_modules, '__all__'):
        for name in custom_modules:
            if name not in nn_modules.__all__:
                nn_modules.__all__.append(name)

    print(f"[CA-YOLOv8] Registered {len(custom_modules)} custom modules: {list(custom_modules.keys())}")
    return custom_modules
