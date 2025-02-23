(window.webpackJsonp=window.webpackJsonp||[]).push([[111],{743:function(a,e,v){"use strict";v.r(e);var _=v(2),t=Object(_.a)({},(function(){var a=this,e=a._self._c;return e("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[e("blockquote",[e("p",[a._v("点击勘误"),e("a",{attrs:{href:"https://github.com/webVueBlog/JavaPlusDoc/issues",target:"_blank",rel:"noopener noreferrer"}},[a._v("issues"),e("OutboundLink")],1),a._v("，哪吒感谢大家的阅读")])]),a._v(" "),e("img",{attrs:{align:"right",width:"100",src:"https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png"}}),a._v(" "),e("h2",{attrs:{id:"treemap详解"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#treemap详解"}},[a._v("#")]),a._v(" TreeMap详解")]),a._v(" "),e("p",[a._v("HashMap 是无序的，所以有了 LinkedHashMap，加上了双向链表后，就可以保持元素的插入顺序和访问顺序，那 TreeMap 呢？")]),a._v(" "),e("p",[a._v("TreeMap 由红黑树实现，可以保持元素的自然顺序，或者实现了 Comparator 接口的自定义顺序。")]),a._v(" "),e("blockquote",[e("p",[a._v("红黑树（英语：Red–black tree）是一种自平衡的二叉查找树（Binary Search Tree），结构复杂，但却有着良好的性能，完成查找、插入和删除的时间复杂度均为 log(n)。")])]),a._v(" "),e("p",[a._v("二叉查找树是一种常见的树形结构，它的每个节点都包含一个键值对。每个节点的左子树节点的键值小于该节点的键值，右子树节点的键值大于该节点的键值，这个特性使得二叉查找树非常适合进行数据的查找和排序操作。")]),a._v(" "),e("p",[a._v("一颗典型的二叉查找树：")]),a._v(" "),e("ul",[e("li",[a._v("1）左子树上所有节点的值均小于或等于它的根结点的值。")]),a._v(" "),e("li",[a._v("2）右子树上所有节点的值均大于或等于它的根结点的值。")]),a._v(" "),e("li",[a._v("3）左、右子树也分别为二叉查找树。")])]),a._v(" "),e("p",[a._v("二叉查找树用来查找非常方面，从根节点开始遍历，如果当前节点的键值等于要查找的键值，则查找成功；如果要查找的键值小于当前节点的键值，则继续遍历左子树；如果要查找的键值大于当前节点的键值，则继续遍历右子树。如果遍历到叶子节点仍然没有找到，则查找失败。")]),a._v(" "),e("p",[a._v("插入操作也非常简单，从根节点开始遍历，如果要插入的键值小于当前节点的键值，则将其插入到左子树中；如果要插入的键值大于当前节点的键值，则将其插入到右子树中。如果要插入的键值已经存在于树中，则更新该节点的值。")]),a._v(" "),e("p",[a._v("删除操作稍微复杂一些，需要考虑多种情况，包括要删除的节点是叶子节点、要删除的节点只有一个子节点、要删除的节点有两个子节点等等。")]),a._v(" "),e("p",[a._v("总之，二叉查找树是一种非常常用的数据结构，它可以帮助我们实现数据的查找、排序和删除等操作。")]),a._v(" "),e("p",[a._v("平衡二叉树就像是一棵树形秤，它的左右两边的重量要尽可能的平衡。当我们往平衡二叉树中插入一个节点时，平衡二叉树会自动调整节点的位置，以保证树的左右两边的高度差不超过1。类似地，当我们删除一个节点时，平衡二叉树也会自动调整节点的位置，以保证树的左右两边的高度差不超过1。")]),a._v(" "),e("p",[a._v("常见的平衡二叉树包括AVL树、红黑树等等，它们都是通过旋转操作来调整树的平衡，使得左子树和右子树的高度尽可能接近。")]),a._v(" "),e("p",[a._v("AVL树是一种高度平衡的二叉查找树，它要求左子树和右子树的高度差不超过1。由于AVL树的平衡度比较高，因此在进行插入和删除操作时需要进行更多的旋转操作来保持平衡，但是在查找操作时效率较高。AVL树适用于读操作比较多的场景。")]),a._v(" "),e("p",[a._v("例如，对于一个需要频繁进行查找操作的场景，如字典树、哈希表等数据结构，可以使用AVL树来进行优化。另外，AVL树也适用于需要保证数据有序性的场景，如数据库中的索引。")]),a._v(" "),e("p",[a._v("AVL树最初由两位苏联的计算机科学家，Adelson-Velskii和Landis，于1962年提出。因此，AVL树就以他们两人名字的首字母缩写命名了。")]),a._v(" "),e("p",[a._v("AVL树的发明对计算机科学的发展有着重要的影响，不仅为后来的平衡二叉树提供了基础，而且为其他领域的数据结构和算法提供了启示。")]),a._v(" "),e("h2",{attrs:{id:"红黑树"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#红黑树"}},[a._v("#")]),a._v(" 红黑树")]),a._v(" "),e("p",[a._v("红黑树，顾名思义，就是节点是红色或者黑色的平衡二叉树，它通过颜色的约束来维持二叉树的平衡，它要求任意一条路径上的黑色节点数目相同，同时还需要满足一些其他特定的条件，如红色节点的父节点必须为黑色节点等。")]),a._v(" "),e("ul",[e("li",[a._v("1）每个节点都只能是红色或者黑色")]),a._v(" "),e("li",[a._v("2）根节点是黑色")]),a._v(" "),e("li",[a._v("3）每个叶节点（NIL 节点，空节点）是黑色的。")]),a._v(" "),e("li",[a._v("4）如果一个节点是红色的，则它两个子节点都是黑色的。也就是说在一条路径上不能出现相邻的两个红色节点。")]),a._v(" "),e("li",[a._v("5）从任一节点到其每个叶子的所有路径都包含相同数目的黑色节点。")])]),a._v(" "),e("p",[a._v("由于红黑树的平衡度比AVL树稍低，因此在进行插入和删除操作时需要进行的旋转操作较少，但是在查找操作时效率仍然较高。红黑树适用于读写操作比较均衡的场景。")]),a._v(" "),e("h2",{attrs:{id:"自然顺序"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#自然顺序"}},[a._v("#")]),a._v(" 自然顺序")]),a._v(" "),e("p",[a._v("默认情况下，TreeMap 是根据 key 的自然顺序排列的。比如说整数，就是升序，1、2、3、4、5。")]),a._v(" "),e("h2",{attrs:{id:"自定义排序"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#自定义排序"}},[a._v("#")]),a._v(" 自定义排序")]),a._v(" "),e("p",[a._v("如果自然顺序不满足，那就可以在声明 TreeMap 对象的时候指定排序规则。")]),a._v(" "),e("p",[a._v("Comparator.reverseOrder() 返回的是 Collections.ReverseComparator 对象，就是用来反转顺序的，非常方便。")]),a._v(" "),e("p",[a._v("HashMap 是无序的，插入的顺序随着元素的增加会不停地变动。但 TreeMap 能够至始至终按照指定的顺序排列，这对于需要自定义排序的场景")]),a._v(" "),e("h2",{attrs:{id:"排序的好处"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#排序的好处"}},[a._v("#")]),a._v(" 排序的好处")]),a._v(" "),e("p",[a._v("既然 TreeMap 的元素是经过排序的，那找出最大的那个，最小的那个，或者找出所有大于或者小于某个值的键来说，就方便多了。")]),a._v(" "),e("p",[a._v("TreeMap 考虑得很周全，恰好就提供了 lastKey()、firstKey() 这样获取最后一个 key 和第一个 key 的方法。")]),a._v(" "),e("p",[a._v("headMap() 获取的是到指定 key 之前的 key；tailMap() 获取的是指定 key 之后的 key（包括指定 key）。")]),a._v(" "),e("h2",{attrs:{id:"如何选择-map"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#如何选择-map"}},[a._v("#")]),a._v(" 如何选择 Map")]),a._v(" "),e("p",[a._v("需要考虑以下因素：")]),a._v(" "),e("ol",[e("li",[a._v("是否需要按照键的自然顺序或者自定义顺序进行排序。如果需要按照键排序，则可以使用 TreeMap；如果不需要排序，则可以使用 HashMap 或 LinkedHashMap。")]),a._v(" "),e("li",[a._v("是否需要保持插入顺序。如果需要保持插入顺序，则可以使用 LinkedHashMap；如果不需要保持插入顺序，则可以使用 TreeMap 或 HashMap。")]),a._v(" "),e("li",[a._v("是否需要高效的查找。如果需要高效的查找，则可以使用 LinkedHashMap 或 HashMap，因为它们的查找操作的时间复杂度为 O(1)，而是 TreeMap 是 O(log n)。")])]),a._v(" "),e("p",[a._v("LinkedHashMap 内部使用哈希表来存储键值对，并使用一个双向链表来维护插入顺序，但查找操作只需要在哈希表中进行，与链表无关，所以时间复杂度为 O(1)")]),a._v(" "),e("p",[a._v("来个表格吧，一目了然。")]),a._v(" "),e("p",[a._v("特性\tTreeMap\tHashMap\tLinkedHashMap\n排序\t支持\t不支持\t不支持\n插入顺序\t不保证\t不保证\t保证\n查找效率\tO(log n)\tO(1)\tO(1)\n空间占用\t通常较大\t通常较小\t通常较大\n适用场景\t需要排序的场景\t无需排序的场景\t需要保持插入顺序")])])}),[],!1,null,null,null);e.default=t.exports}}]);