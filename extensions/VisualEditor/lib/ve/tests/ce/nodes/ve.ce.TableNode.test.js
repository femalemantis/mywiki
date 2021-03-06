/*!
 * VisualEditor ContentEditable TableNode tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ce.TableNode' );

/* Tests */

QUnit.test( 'getNearestCellNode', function ( assert ) {
	var i,
		view = ve.test.utils.createSurfaceViewFromHtml(
			'<table>' +
				'<tr><td>Foo' +
					'<table><tr><td>Bar</td></tr></table>' +
				'</td><td>Baz</td></tr>' +
			'</table>'
		),
		documentNode = view.getDocument().getDocumentNode(),
		tableNode = documentNode.children[ 0 ],
		$tableNode = tableNode.$element,
		cases = [
			{
				msg: 'Table cell',
				element: $tableNode.find( 'td' )[ 0 ],
				node: documentNode.children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ]
			},
			{
				msg: 'Paragraph inside cell',
				element: $tableNode.find( 'td' ).last().find( 'p' )[ 0 ],
				node: documentNode.children[ 0 ].children[ 0 ].children[ 0 ].children[ 1 ]
			},
			{
				msg: 'Cell inside nested table',
				element: $tableNode.find( 'table td' ).first()[ 0 ],
				node: null
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		assert.strictEqual( tableNode.getNearestCellNode( cases[ i ].element ), cases[ i ].node, cases[ i ].msg );
	}
	view.destroy();
} );

QUnit.test( 'getFirstSectionNode', function ( assert ) {
	var view = ve.test.utils.createSurfaceViewFromHtml(
			'<table>' +
				'<caption>Caption</caption>' +
				'<tr><td>Foo</td></tr>' +
			'</table>'
		),
		documentNode = view.getDocument().getDocumentNode(),
		tableNode = documentNode.children[ 0 ],
		result = tableNode.getFirstSectionNode();

	assert.strictEqual( result instanceof ve.ce.TableSectionNode, true, 'result is a TableSectionNode' );
	assert.strictEqual( result, tableNode.children[ 1 ], 'result is 2nd child of table' );
} );

QUnit.test( 'onTableMouseDown/onTableMouseMove/onTableMouseUp/onTableDblClick', function ( assert ) {
	var expectedSelection,
		view = ve.test.utils.createSurfaceViewFromDocument( ve.dm.example.createExampleDocument( 'mergedCells' ) ),
		model = view.getModel(),
		documentNode = view.getDocument().getDocumentNode(),
		tableNode = documentNode.children[ 0 ],
		cell = tableNode.children[ 0 ].children[ 3 ].children[ 1 ],
		e = {
			target: cell.$element[ 0 ],
			originalEvent: { pageX: 0, pageY: 0 },
			preventDefault: function () {}
		};

	tableNode.onTableMouseDown( e );
	tableNode.onTableMouseMove( e );
	tableNode.onTableMouseUp( e );

	expectedSelection = ve.test.utils.selectionFromRangeOrSelection(
		model.getDocument(),
		{
			type: 'table',
			tableRange: new ve.Range( 0, 171 ),
			fromCol: 1,
			fromRow: 3,
			toCol: 3,
			toRow: 5
		}
	);
	assert.equalHash( model.getSelection(), expectedSelection, ': selection' );

	tableNode.onTableDblClick( e );

	expectedSelection = ve.test.utils.selectionFromRangeOrSelection(
		model.getDocument(),
		new ve.Range( 94 )
	);
	assert.equalHash( model.getSelection(), expectedSelection, ': selection' );
} );

QUnit.test( 'onTableMouseDown', function ( assert ) {
	var i,
		view = ve.test.utils.createSurfaceViewFromHtml(
			'<table><tr><td>Foo</td><td>Bar</td></tr></table>'
		),
		documentNode = view.getDocument().getDocumentNode(),
		tableNode = documentNode.children[ 0 ],
		$tableNode = tableNode.$element,
		mockEvent = {
			preventDefault: function () {}
		},
		cases = [
			{
				msg: 'Table cell',
				event: {
					target: $tableNode.find( 'td' )[ 0 ]
				},
				expectedSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 20 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				}
			},
			{
				msg: 'Shift click second cell paragraph',
				event: {
					target: $tableNode.find( 'td' ).last().find( 'p' )[ 0 ],
					shiftKey: true
				},
				expectedSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 20 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 1,
					toRow: 0
				}
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		tableNode.onTableMouseDown( $.extend( mockEvent, cases[ i ].event ) );
		assert.deepEqual(
			tableNode.surface.getModel().getSelection().toJSON(),
			cases[ i ].expectedSelection,
			cases[ i ].msg
		);
		// Clear document mouse up handlers
		tableNode.onTableMouseUp();
	}
	view.destroy();
} );
