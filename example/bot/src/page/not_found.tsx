import './page.css';

import { Button, HelpButton } from '../component/button';
import { Header, HeaderSize } from '../component/header';
import { useNavigate } from 'react-router';
import { NavIntent } from '../common';

export function NotFoundPage() {
	const nav = useNavigate();

	return (
		<div className='page'>
			<header>
				<Header size={HeaderSize.Full}></Header>
			</header>

			<article>
				<div className='text-center'>
					<h1>Oops!</h1>
					<p>
						Page not found :3
					</p>
					<div className="mt-5">
						<Button
							text='Close'
							onClick={() => {
								nav('/', { state: new NavIntent().withBackwardAnimation() })
							}}
						/>
					</div>
				</div>
			</article>

			<footer>
				<HelpButton />
			</footer>
		</div >
	);
}

