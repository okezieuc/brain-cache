import { Highlight } from "react-instantsearch";

export default function SearchHit(props: { hit: any }) {
  return (
    <div>
      {/*<img src={props.hit.image} align="left" alt={props.hit.name} />
        <div className="hit-name">
          <Highlight attribute="name" hit={props.hit} />
        </div>
        <div className="hit-description">
          <Highlight attribute="description" hit={props.hit} />
        </div>
    <div className="hit-price">${props.hit.price}</div>*/}
      {JSON.stringify(props.hit)}
    </div>
  );
}
