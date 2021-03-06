from typing import Dict, Union, Iterable, Callable, TypeVar, Any

T = TypeVar('T')

ElementFn = Union[Callable[[Any], T], Callable[[Any, int], T]]
"""
A function taking a selected element's data as input. This is typically provided as an argument in a selection method,
allowing attributes to be configured differently for each element.

:param ElementFn.data:
    The data associated with the element.
    If the :meth:`~graphics.Selection.data` method was used previously in the method chain, it will determine the type of data used.
    If the selection has no associated data, it will fall back on its parent's data (as is the case for :class:`~graphics.LabelSelection`).
    Otherwise, the information used to construct the selection will serve as its data (such as node ID values and edge tuples).

:param ElementFn.index:
    (Optional) The index of the element in the selection, beginning at 0, determined by its position in the list
    initially used to construct the selection.
"""

ElementArg = Union[ElementFn[T], T]
"""
Allows an argument to be provided either directly, or as a function of each element's data
(see :data:`ElementFn` and :meth:`~graphics.Selection.data`).
"""


NumExpr = Union[int, float, str, Dict]
"""
A number, or an expression evaluating to a number. Expressions must be in the form ``mx+c``, described by either an
``{ m, x, c }`` dictionary, or an expression string such as "-2x+8". Both ``m`` and ``c`` are constants, while ``x`` is a
variable corresponding to some other attribute. Below is a list of valid variables and the context in which they
can be used:

* "cx": Half the width of the canvas.
* "cy": Half the height of the canvas.

* nodes
    * "x": Half the width of the node.
    * "y": Half the height of the node.

    * labels
        * "r": Distance from the center of the node to its boundary given the angle attribute of the label.
"""
