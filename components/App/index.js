import tw, { styled } from "twin.macro"
import { useState, useEffect } from "react"
import { DragDropContext } from "react-beautiful-dnd"

import Sidebar from "../Sidebar"
import Column from "../Column"
import Item from "../Item"
import { createTree } from "../../lib/Tree"

// Fake data
import data from "../../data"

const Columns = styled.div`
  ${tw`flex flex-grow bg-gray-100 overflow-auto`}
  scroll-snap-type: x mandatory;

  // This is a dodgy hack until I can work out how to get the margin at the end
  &:after {
    content: ".";
    color: transparent;
  }
`

const App = () => {
  const [tree, setTree] = useState(null)
  const [path, setPath] = useState([])

  useEffect(() => {
    const tree = createTree(data, {
      delete: deletedNode => setPath(deletedNode.parent.path),
    })
    setTree(tree)
    setPath(tree.root.path)
  }, [])

  function onDragEnd(result) {
    const { draggableId, source, destination } = result

    // Dropped outside the list
    if (!destination) return

    const srcNode = tree.root.find(n => n.id === draggableId)
    const dstNode = tree.root.find(n => n.id === destination.droppableId)

    // Reorder within the same droppable
    if (source.droppableId === destination.droppableId) {
      srcNode.setIndex(destination.index)
      setPath(srcNode.path)

      // Move to a different column
    } else {
      const removedNode = srcNode.delete()
      dstNode.addChild(removedNode, destination.index)
      setPath(dstNode.path)
    }
  }

  const stringifyPath = node => node.map(n => n.id).join("/")
  const withinCurrentPath = givenPath =>
    stringifyPath(path).match(stringifyPath(givenPath))

  return (
    <>
      {tree && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Columns>
            <Sidebar root={tree.root} />
            {path.map((node, columnIndex) => (
              <Column
                key={node.id}
                node={node}
                renderChild={(childNode, childIndex) => {
                  const isSelected = withinCurrentPath(childNode.path)
                  return (
                    <Item
                      key={childNode.id}
                      node={childNode}
                      index={childIndex}
                      isSelected={isSelected}
                      hasReducedFocus={!!path[columnIndex + 1]}
                      onClick={() => {
                        setPath(isSelected ? node.path : childNode.path)
                      }}
                    />
                  )
                }}
              />
            ))}
          </Columns>
        </DragDropContext>
      )}
    </>
  )
}

export default App
