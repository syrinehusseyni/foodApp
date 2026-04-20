# TODO: Exact unavailable overlay logic like ManageMenu (integrated list, no reordering)

Previous steps [x] (see old TODO.md if needed)

New steps:
- [ ] Backup current MenuItems.jsx logic
- [x] Replace filtering with single menuItems.map
- [x] Add conditional class `menu-card ${!item.available ? 'unavailable' : ''}`
- [x] Add `{!item.available && <div className="unavailable-overlay"> </div>}` in image-wrap (exact snippet)
- [x] Conditional onClick={item.available ? () => openSheet(item) : undefined}
- [x] Conditional + button only if available
- [x] Update topSales to menuItems.filter(i => i.available).slice(0,2)
- [x] Remove unavailable section/title
- [x] Test toggle no reordering, grey/overlay/unclickable (applied exact snippet logic: integrated menuItems.map, conditional overlay/class/button/onClick, no sections/reordering)
- [x] Complete

